from rest_framework import serializers
from .models import Invoice, Payment, PaymentMethod, PaymentTransaction

class PaymentSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'auction', 'auction_title', 'user', 'user_name', 'amount', 
                  'payment_method', 'payment_status', 'transaction_id', 'created_at']
        read_only_fields = ['user', 'payment_status', 'transaction_id', 'created_at']

class InvoiceSerializer(serializers.ModelSerializer):
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'payment', 'issued_date']


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            "id",
            "user",
            "method_type",
            "provider_name",
            "account_name",
            "identifier",
            "is_default",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source="auction.title", read_only=True)
    payer_name = serializers.CharField(source="payer.username", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "auction",
            "auction_title",
            "payer",
            "payer_name",
            "seller",
            "seller_name",
            "amount",
            "payment_method",
            "method_type",
            "transaction_reference",
            "status",
            "paid_at",
            "payout_status",
            "payout_completed_at",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "payer", "seller", "paid_at", "payout_completed_at", "created_at", "updated_at"]
