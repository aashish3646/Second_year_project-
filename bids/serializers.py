from rest_framework import serializers
from .models import Bid, BidHistory
from auctions.models import Auction
from django.db import transaction

class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    auction_status = serializers.CharField(source='auction.status', read_only=True)
    auction_end_time = serializers.DateTimeField(source='auction.end_time', read_only=True)

    class Meta:
        model = Bid
        fields = ['id', 'auction', 'auction_title', 'auction_status', 'auction_end_time', 
                  'bidder', 'bidder_name', 'amount', 'is_winning', 'created_at']
        read_only_fields = ['bidder', 'is_winning', 'created_at']

    def validate(self, data):
        auction = data.get('auction')
        amount = data.get('amount')
        user = self.context['request'].user

        # Check if auction is active
        if not auction.is_active:
            raise serializers.ValidationError("This auction is not active")

        # Check if user is the seller
        if auction.seller == user:
            raise serializers.ValidationError("Sellers cannot bid on their own auctions")

        # Check if bid is higher than current bid
        if amount <= auction.current_bid:
            raise serializers.ValidationError(
                f"Bid must be higher than current bid of ${auction.current_bid}"
            )

        return data

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
        auction = validated_data['auction']
        
        # Mark all previous bids as not winning
        Bid.objects.filter(auction=auction, is_winning=True).update(is_winning=False)
        
        # Create new bid
        bid = Bid.objects.create(**validated_data, is_winning=True)
        
        # Update auction current bid
        auction.current_bid = validated_data['amount']
        auction.save()
        
        # Create bid history
        BidHistory.objects.create(
            auction=auction,
            bidder=validated_data['bidder'],
            amount=validated_data['amount']
        )
        
        return bid

    def update(self, instance, validated_data):
        amount = validated_data.get('amount')
        if not amount:
            return super().update(instance, validated_data)

        auction = instance.auction
        user = self.context['request'].user

        if not auction.is_active:
            raise serializers.ValidationError("This auction is not active.")

        if amount <= auction.current_bid:
            raise serializers.ValidationError(f"New bid must exceed current ceiling of ${auction.current_bid}")

        with transaction.atomic():
            # Identify previous winner (might be the same user increasing their lead)
            previous_winner_bid = Bid.objects.filter(auction=auction, is_winning=True).first()
            
            # Reset all winning flags for this auction
            Bid.objects.filter(auction=auction, is_winning=True).update(is_winning=False)

            # Update the current bid instance
            instance.amount = amount
            instance.is_winning = True
            instance.save()

            # Sync Auction
            auction.current_bid = amount
            auction.save(update_fields=['current_bid'])

            # Log history
            BidHistory.objects.create(auction=auction, bidder=user, amount=amount)

            # Notifications
            from notifications.views import create_notification
            
            # 1. Notify Seller
            if auction.seller != user:
                create_notification(
                    user=auction.seller,
                    notification_type='bid_placed',
                    title=f"Bid Revised: {auction.title}",
                    message=f"{user.username} increased their bid to ${amount}.",
                    link=f"/auctions/{auction.id}"
                )

            # 2. Notify Outbid (if it wasn't the same user)
            if previous_winner_bid and previous_winner_bid.bidder != user:
                create_notification(
                    user=previous_winner_bid.bidder,
                    notification_type='bid_outbid',
                    title=f"Counter-Move on {auction.title}",
                    message=f"A higher bid of ${amount} has been placed.",
                    link=f"/auctions/{auction.id}"
                )

        return instance

class BidHistorySerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)

    class Meta:
        model = BidHistory
        fields = ['id', 'bidder', 'bidder_name', 'amount', 'timestamp']


class AuctionBidCreateSerializer(serializers.Serializer):
    """
    Used for POST /api/auctions/{id}/bids
    Payload: { "amount": "123.45" }
    """

    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, attrs):
        request = self.context['request']
        auction = self.context['auction']
        amount = attrs['amount']

        if auction.seller_id == request.user.id:
            raise serializers.ValidationError("Sellers cannot bid on their own auctions.")

        if not auction.is_active:
            raise serializers.ValidationError("This auction is not active.")

        current_floor = auction.current_bid or auction.starting_bid
        if amount <= current_floor:
            raise serializers.ValidationError(f"Bid must be higher than current bid of {current_floor}.")

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        auction = self.context['auction']
        amount = validated_data['amount']

        with transaction.atomic():
            auction = Auction.objects.select_for_update().get(pk=auction.pk)
            if not auction.is_active:
                raise serializers.ValidationError("This auction is not active.")

            current_floor = auction.current_bid or auction.starting_bid
            if amount <= current_floor:
                raise serializers.ValidationError(f"Bid must be higher than current bid of {current_floor}.")

            # Identify previous winner before updating
            previous_winner_bid = Bid.objects.filter(auction=auction, is_winning=True).first()
            
            Bid.objects.filter(auction=auction, is_winning=True).update(is_winning=False)

            bid = Bid.objects.create(
                auction=auction,
                bidder=request.user,
                amount=amount,
                is_winning=True,
            )

            auction.current_bid = amount
            auction.save(update_fields=['current_bid'])

            BidHistory.objects.create(auction=auction, bidder=request.user, amount=amount)

            # Notifications
            from notifications.views import create_notification, notify_admins
            
            # 0. Notify admins if a seller is bidding (for monitoring)
            if request.user.role == 'seller':
                notify_admins(
                    notification_type='admin_alert',
                    title='Seller Bidding Alert',
                    message=f"Seller {request.user.username} placed a bid of ${amount} on auction: {auction.title}",
                    link=f"/auctions/{auction.id}"
                )

            # 1. Notify the seller
            if auction.seller != request.user:
                create_notification(
                    user=auction.seller,
                    notification_type='bid_placed',
                    title=f"New bid on your auction: {auction.title}",
                    message=f"{request.user.username} placed a bid of ${amount}.",
                    link=f"/auctions/{auction.id}"
                )
            
            # 2. Notify the previous winner (outbid)
            if previous_winner_bid and previous_winner_bid.bidder != request.user:
                create_notification(
                    user=previous_winner_bid.bidder,
                    notification_type='bid_outbid',
                    title=f"You have been outbid on {auction.title}",
                    message=f"Someone placed a higher bid of ${amount}.",
                    link=f"/auctions/{auction.id}"
                )

        return bid
