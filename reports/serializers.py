from rest_framework import serializers
from payments.models import PaymentTransaction, Payment
from auctions.models import Auction
from accounts.models import User

class TransactionReportSerializer(serializers.ModelSerializer):
    payer_name = serializers.CharField(source='payer.username', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    auction_title = serializers.CharField(source='auction.title', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'auction', 'auction_title', 'payer', 'payer_name', 
            'seller', 'seller_name', 'amount', 'status', 'created_at'
        ]

class PlatformStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_sellers = serializers.IntegerField()
    total_auctions = serializers.IntegerField()
    total_sales_volume = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_auctions = serializers.IntegerField()
    pending_auctions = serializers.IntegerField()

class PublicStatsSerializer(serializers.Serializer):
    active_users = serializers.IntegerField()
    total_bids = serializers.IntegerField()
    active_listings = serializers.IntegerField()
    market_volume = serializers.DecimalField(max_digits=12, decimal_places=2)
    market_trend = serializers.CharField()
