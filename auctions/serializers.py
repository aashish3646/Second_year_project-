from rest_framework import serializers
from .models import Auction, Category, AuctionImage
from django.contrib.auth import get_user_model

User = get_user_model()

class AuctionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionImage
        fields = ['id', 'image', 'uploaded_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'requires_manual_review', 'description', 'created_at']

class AuctionSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_email = serializers.CharField(source='seller.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = AuctionImageSerializer(many=True, read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    total_bids = serializers.IntegerField(read_only=True)

    class Meta:
        model = Auction
        fields = [
            'id', 'seller', 'seller_name', 'seller_email', 'category', 'category_name',
            'title', 'description', 'starting_bid', 'current_bid', 'image', 'status',
            'location_address', 'latitude', 'longitude', 'start_time', 'end_time',
            'views_count', 'created_at', 'updated_at', 'images', 'is_active', 'is_upcoming', 'total_bids'
        ]
        read_only_fields = ['seller', 'current_bid', 'views_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)

class AuctionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = [
            'category', 'title', 'description', 'starting_bid', 'image',
            'location_address', 'latitude', 'longitude', 'start_time', 'end_time'
        ]
        extra_kwargs = {
            'category': {'required': False, 'allow_null': True},
            'image': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        validated_data['current_bid'] = validated_data['starting_bid']
        
        # Mandatory admin approval for all new auctions
        validated_data["status"] = "pending"
        
        auction = super().create(validated_data)

        # Notifications
        from notifications.views import create_notification, notify_admins
        
        # Notify admins of new auction creation
        notify_admins(
            notification_type='admin_alert',
            title='New Auction Submitted for Approval',
            message=f"A new auction '{auction.title}' has been created by {auction.seller.username} ({auction.status}).",
            link=f"/auctions/{auction.id}"
        )

        title = "Auction Ongoing Approval"
        msg = f"Your auction '{auction.title}' has been submitted for review."
            
        create_notification(
            user=auction.seller,
            notification_type='new_auction',
            title=title,
            message=msg,
            link=f"/auctions/{auction.id}"
        )

        return auction
