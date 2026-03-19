from django.db import models
from django.conf import settings
from auctions.models import Auction


class PaymentMethodType(models.TextChoices):
    ESEWA = "esewa", "eSewa"
    KHALTI = "khalti", "Khalti"
    FONEPAY = "fonepay", "Fonepay"
    PAYPAL = "paypal", "PayPal"
    STRIPE = "stripe", "Stripe"
    BANK_TRANSFER = "bank_transfer", "Bank transfer"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SUCCESSFUL = "successful", "Successful"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"
    PAYOUT_PENDING = "payout_pending", "Payout pending"
    PAYOUT_COMPLETED = "payout_completed", "Payout completed"


class PaymentMethod(models.Model):
    """
    Saved method for paying in (buyer) or paying out (seller).
    Store only non-sensitive identifiers/metadata.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_methods")
    method_type = models.CharField(max_length=32, choices=PaymentMethodType.choices)
    provider_name = models.CharField(max_length=64, blank=True, null=True)
    account_name = models.CharField(max_length=120, blank=True, null=True)
    identifier = models.CharField(max_length=120, blank=True, null=True)  # e.g., phone/email/bank acct (masked by UI)
    is_default = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "method_type", "is_default"])]

    def __str__(self):
        return f"PaymentMethod<{self.user_id}:{self.method_type}>"


class PaymentTransaction(models.Model):
    """
    Canonical transaction record (future-proof for gateway integrations).
    """

    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="payment_transactions")
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payment_transactions")
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sales_payment_transactions",
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="transactions",
    )
    method_type = models.CharField(max_length=32, choices=PaymentMethodType.choices)

    transaction_reference = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=32, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    paid_at = models.DateTimeField(blank=True, null=True)

    payout_status = models.CharField(max_length=32, choices=PaymentStatus.choices, default=PaymentStatus.PAYOUT_PENDING)
    payout_completed_at = models.DateTimeField(blank=True, null=True)

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auction", "payer"]),
            models.Index(fields=["seller", "status"]),
        ]

    def __str__(self):
        return f"PaymentTransaction<{self.id}:{self.status}:{self.amount}>"


class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD = (
        ('stripe', 'Stripe'),
        ('khalti', 'Khalti'),
        ('esewa', 'eSewa'),
    )

    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - ${self.amount} ({self.payment_status})"

    class Meta:
        ordering = ['-created_at']

class Invoice(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    issued_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.invoice_number}"

    class Meta:
        ordering = ['-issued_date']
