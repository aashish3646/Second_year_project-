from django.db.models import Q
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bids.models import Bid
from bids.serializers import AuctionBidCreateSerializer, BidSerializer
from adminpanel.models import AdminReviewLog
from .models import Auction, Category
from .serializers import AuctionCreateSerializer, AuctionSerializer, CategorySerializer
from .utils import close_expired_auctions

def _is_admin(user) -> bool:
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser or getattr(user, 'role', None) == 'admin')
    )


class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                _is_admin(request.user)
                or getattr(request.user, "is_verified_seller", False)
                or request.user.role == "seller"
            )
        )


class IsBidder(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (_is_admin(request.user) or request.user.role == 'bidder'))


class IsSellerOrAdminOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if _is_admin(request.user):
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'seller' and obj.seller_id == request.user.id)


class AuctionViewSet(viewsets.ModelViewSet):
    """
    /api/auctions
    /api/auctions/{id}
    /api/auctions/mine
    /api/auctions/{id}/bids
    """

    queryset = Auction.objects.select_related('seller', 'category').all()
    serializer_class = AuctionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name', 'seller__username']
    ordering_fields = ['created_at', 'end_time', 'current_bid', 'starting_bid']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AuctionCreateSerializer
        return AuctionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'categories']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsSeller()]
        if self.action in ['partial_update', 'update', 'destroy']:
            return [permissions.IsAuthenticated(), IsSellerOrAdminOwner()]
        if self.action == 'mine':
            return [permissions.IsAuthenticated(), IsSeller()]
        if self.action == 'bids':
            if self.request.method == 'GET':
                return [permissions.AllowAny()]
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Just-in-time settlement of expired auctions
        close_expired_auctions()
        
        qs = super().get_queryset()

        # Public list defaults to active only; sellers/admins can also query their own non-active auctions
        if self.action == 'list' and not _is_admin(self.request.user):
            qs = qs.filter(status='active')

        status_param = self.request.query_params.get('status')
        if status_param:
            if _is_admin(self.request.user):
                qs = qs.filter(status=status_param)
            else:
                # Non-admins can only request active OR their own auctions
                qs = qs.filter(Q(status='active') | Q(seller=self.request.user)).filter(status=status_param)

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)

        seller = self.request.query_params.get('seller')
        if seller:
            qs = qs.filter(seller_id=seller)

        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count = (instance.views_count or 0) + 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='categories', permission_classes=[permissions.AllowAny])
    def categories(self, request):
        qs = Category.objects.all().order_by('name')
        return Response(CategorySerializer(qs, many=True).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        qs = Auction.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(AuctionSerializer(page, many=True).data)
        return Response(AuctionSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='bids')
    def bids(self, request, pk=None):
        auction = self.get_object()

        if request.method == 'GET':
            qs = Bid.objects.filter(auction=auction).select_related('bidder').order_by('-created_at')
            return Response(BidSerializer(qs, many=True).data, status=status.HTTP_200_OK)

        serializer = AuctionBidCreateSerializer(
            data=request.data,
            context={'request': request, 'auction': auction},
        )
        serializer.is_valid(raise_exception=True)
        bid = serializer.save()
        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="admin-review")
    def admin_review(self, request, pk=None):
        if not _is_admin(request.user):
            return Response({"detail": "Admin only."}, status=status.HTTP_403_FORBIDDEN)

        auction = self.get_object()
        action_name = request.data.get("action")
        remarks = request.data.get("remarks", "")

        if action_name == "approve":
            auction.status = "active"
        elif action_name == "reject":
            auction.status = "rejected"
        elif action_name == "flag":
            auction.status = "pending"
        else:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        auction.save(update_fields=["status", "updated_at"])

        # Notifications
        from notifications.views import create_notification
        ntype = 'auction_approved' if action_name == 'approve' else 'auction_rejected'
        title = f"Auction {action_name.capitalize()}d"
        msg = f"Your auction '{auction.title}' has been {action_name}d by an admin."
        if remarks:
            msg += f" Remarks: {remarks}"
            
        create_notification(
            user=auction.seller,
            notification_type=ntype,
            title=title,
            message=msg,
            link=f"/auctions/{auction.id}"
        )

        AdminReviewLog.objects.create(
            admin=request.user,
            target_type="auction",
            target_id=str(auction.id),
            action=action_name,
            remarks=remarks,
        )

        return Response(AuctionSerializer(auction, context={"request": request}).data, status=status.HTTP_200_OK)
