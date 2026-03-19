from django.db import models
from django.conf import settings
from auctions.models import Auction

class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_winning = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bidder.username} - ${self.amount} on {self.auction.title}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['auction', 'bidder', 'amount']

class BidHistory(models.Model):
    """Track all bid activities for transparency"""
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bid_history')
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bidder.username} bid ${self.amount} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Bid histories'
