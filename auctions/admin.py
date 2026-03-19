from django.contrib import admin
from .models import Category, Auction, AuctionImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

class AuctionImageInline(admin.TabularInline):
    model = AuctionImage
    extra = 1

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'category', 'starting_bid', 'current_bid', 'status', 'start_time', 'end_time']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'description', 'seller__username']
    inlines = [AuctionImageInline]
    readonly_fields = ['views_count', 'created_at', 'updated_at']
