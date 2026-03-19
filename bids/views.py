from rest_framework import viewsets, permissions
from .models import Bid
from .serializers import BidSerializer

class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only bids placed by the current user, or all if admin
        user = self.request.user
        if user.is_staff or getattr(user, 'role', None) == 'admin':
            return Bid.objects.all().select_related('auction', 'bidder').order_by('-created_at')
        return Bid.objects.filter(bidder=user).select_related('auction', 'bidder').order_by('-created_at')
