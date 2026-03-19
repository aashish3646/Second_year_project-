
"""
Models for the auctions app, including Category, Auction, and AuctionImage.
"""

from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    """
    Model representing an auction category.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    requires_manual_review = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """String representation of the category (its name)."""
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base = slugify(self.name)
            slug = base
            i = 2
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    class Meta:
        """Meta options for Category model."""
        verbose_name_plural = 'Categories'
        ordering = ['name']

class Auction(models.Model):
    """
    Model representing an auction listing.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    )
    
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='auctions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='auctions')
    title = models.CharField(max_length=255)
    description = models.TextField()
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)
    current_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='auction_images/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Location fields for map integration
    location_address = models.CharField(max_length=500, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Timing
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    # Metadata
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """String representation of the auction (its title)."""
        return self.title

    @property
    def is_active(self):
        """Return True if the auction is currently active."""
        from django.utils import timezone
        now = timezone.now()
        return self.status == 'active' and self.start_time <= now <= self.end_time

    @property
    def is_upcoming(self):
        """Return True if the auction is active but hasn't started yet."""
        from django.utils import timezone
        now = timezone.now()
        return self.status == 'active' and now < self.start_time

    @property
    def total_bids(self):
        """Return the total number of bids for this auction."""
        return self.bids.count()

    class Meta:
        """Meta options for Auction model."""
        ordering = ['-created_at']

class AuctionImage(models.Model):
    """
    Model representing images associated with an auction.
    """
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='auction_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """String representation of the auction image."""
        return f"Image for {self.auction.title}"

    class Meta:
        """Meta options for AuctionImage model."""
        ordering = ['uploaded_at']
