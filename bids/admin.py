from django.contrib import admin
from .models import Bid, BidHistory

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['auction', 'bidder', 'amount', 'is_winning', 'created_at']
    list_filter = ['is_winning', 'created_at']
    search_fields = ['auction__title', 'bidder__username']

@admin.register(BidHistory)
class BidHistoryAdmin(admin.ModelAdmin):
    list_display = ['auction', 'bidder', 'amount', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['auction__title', 'bidder__username']
