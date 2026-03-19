from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db import models
from accounts.models import User
from auctions.models import Auction
from payments.models import PaymentTransaction
from .serializers import TransactionReportSerializer, PlatformStatsSerializer, PublicStatsSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or getattr(request.user, 'role', None) == 'admin')
        )

class AdminStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        stats = {
            'total_users': User.objects.count(),
            'total_sellers': User.objects.filter(role='seller').count(),
            'total_auctions': Auction.objects.count(),
            'total_sales_volume': PaymentTransaction.objects.filter(status='successful').aggregate(Sum('amount'))['amount__sum'] or 0,
            'active_auctions': Auction.objects.filter(status='active').count(),
            'pending_auctions': Auction.objects.filter(status='pending').count(),
        }
        serializer = PlatformStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        qs = PaymentTransaction.objects.select_related('auction', 'payer', 'seller').all().order_by('-created_at')
        serializer = TransactionReportSerializer(qs, many=True)
        return Response(serializer.data)

class PublicStatsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def activity(self, request):
        from bids.models import Bid
        from django.db.models import Sum
        from django.utils import timezone
        import datetime

        active_users_count = User.objects.filter(
            models.Q(auctions__isnull=False) | models.Q(bids__isnull=False)
        ).distinct().count()

        stats = {
            'active_users': active_users_count,
            'total_bids': Bid.objects.count(),
            'active_listings': Auction.objects.filter(status='active').count(),
            'market_volume': PaymentTransaction.objects.filter(status='successful').aggregate(Sum('amount'))['amount__sum'] or 0,
            'market_trend': '+12%', # Placeholder trend logic
        }
        serializer = PublicStatsSerializer(stats)
        return Response(serializer.data)
