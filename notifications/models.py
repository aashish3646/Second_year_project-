from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('bid_placed', 'Bid Placed'),
        ('bid_outbid', 'Bid Outbid'),
        ('auction_won', 'Auction Won'),
        ('auction_ending', 'Auction Ending Soon'),
        ('auction_approved', 'Auction Approved'),
        ('auction_rejected', 'Auction Rejected'),
        ('new_auction', 'New Auction'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']
