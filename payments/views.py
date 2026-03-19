import uuid

from auctions.models import Auction
from bids.models import Bid
from django.db import models
from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from django.utils import timezone
from .models import Payment, PaymentMethod, PaymentMethodType, PaymentStatus, PaymentTransaction
from .serializers import PaymentMethodSerializer, PaymentSerializer, PaymentTransactionSerializer


def _is_admin(user) -> bool:
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser or getattr(user, 'role', None) == 'admin')
    )


class PaymentInitiateSerializer(serializers.Serializer):
    auction = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=[c[0] for c in Payment.PAYMENT_METHOD])


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling payments.
    """
    queryset = Payment.objects.select_related('auction', 'user').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if _is_admin(self.request.user):
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        POST /api/payments/initiate/
        """
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # ... logic from before ...
        auction_id = serializer.validated_data['auction']
        payment_method = serializer.validated_data['payment_method']

        try:
            auction = Auction.objects.get(pk=auction_id)
        except Auction.DoesNotExist:
            return Response({'detail': 'Auction not found.'}, status=status.HTTP_404_NOT_FOUND)

        winning_bid = (
            Bid.objects.filter(auction=auction)
            .order_by('-amount', '-created_at')
            .select_related('bidder')
            .first()
        )
        if not winning_bid:
            return Response({'detail': 'No bids found for this auction.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (_is_admin(request.user) or winning_bid.bidder_id == request.user.id):
            return Response({'detail': 'Only the winning bidder can initiate payment.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure auction has ended
        if auction.status == 'active' and auction.end_time > timezone.now():
            return Response({'detail': 'Payment can only be initiated after the auction has ended.'}, status=status.HTTP_400_BAD_REQUEST)

        transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment.objects.create(
            auction=auction,
            user=winning_bid.bidder,
            amount=winning_bid.amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            payment_status='pending',
        )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        POST /api/payments/{id}/complete/
        """
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not (_is_admin(request.user) or payment.user_id == request.user.id):
            return Response({'detail': 'You do not have permission to complete this payment.'}, status=status.HTTP_403_FORBIDDEN)

        payment.payment_status = 'completed'
        payment.save()

        # If there's an auction associated, we might want to update its status or winning bid status here
        # For now, just mark the payment as completed
        
        return Response(PaymentSerializer(payment).data)




class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        obj = serializer.save(user=self.request.user)
        if obj.is_default:
            PaymentMethod.objects.filter(user=self.request.user).exclude(pk=obj.pk).update(is_default=False)

    def perform_update(self, serializer):
        obj = serializer.save()
        if obj.is_default:
            PaymentMethod.objects.filter(user=self.request.user).exclude(pk=obj.pk).update(is_default=False)


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = PaymentTransaction.objects.select_related("auction", "payer", "seller", "payment_method").all()
        if _is_admin(user):
            return qs
        return qs.filter(models.Q(payer=user) | models.Q(seller=user))

    @action(detail=False, methods=["post"], url_path="create-for-winning-bid")
    def create_for_winning_bid(self, request):
        """
        Creates a canonical PaymentTransaction for the current winning bid.
        Body: { "auction": 123, "method_type": "khalti", "payment_method_id": 1|null }
        """
        auction_id = request.data.get("auction")
        method_type = request.data.get("method_type")
        payment_method_id = request.data.get("payment_method_id")

        if method_type not in {c[0] for c in PaymentMethodType.choices}:
            return Response({"detail": "Invalid method_type."}, status=400)

        try:
            auction = Auction.objects.get(pk=auction_id)
        except Auction.DoesNotExist:
            return Response({"detail": "Auction not found."}, status=404)

        winning_bid = (
            Bid.objects.filter(auction=auction)
            .order_by("-amount", "-created_at")
            .select_related("bidder")
            .first()
        )
        if not winning_bid:
            return Response({"detail": "No bids found for this auction."}, status=400)
        if not (_is_admin(request.user) or winning_bid.bidder_id == request.user.id):
            return Response({"detail": "Only the winning bidder can create payment."}, status=403)

        # Ensure auction has ended
        if auction.status == 'active' and auction.end_time > timezone.now():
            return Response({"detail": "Payment can only be initiated after the auction has ended."}, status=400)

        pm = None
        if payment_method_id:
            pm = PaymentMethod.objects.filter(id=payment_method_id, user=request.user).first()
            if not pm:
                return Response({"detail": "Payment method not found."}, status=404)

        txn = PaymentTransaction.objects.create(
            auction=auction,
            payer=winning_bid.bidder,
            seller=auction.seller,
            amount=winning_bid.amount,
            payment_method=pm,
            method_type=method_type,
            status=PaymentStatus.PENDING,
            payout_status=PaymentStatus.PAYOUT_PENDING,
        )
        return Response(PaymentTransactionSerializer(txn).data, status=201)
