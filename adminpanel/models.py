from __future__ import annotations

from django.conf import settings
from django.db import models


class AdminReviewTargetType(models.TextChoices):
    SELLER_APPLICATION = "seller_application", "Seller application"
    AUCTION = "auction", "Auction"
    DOCUMENT = "document", "Verification document"
    PAYMENT = "payment", "Payment"
    DISPUTE = "dispute", "Dispute / report"


class AdminReviewLog(models.Model):
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_review_logs",
    )
    target_type = models.CharField(max_length=40, choices=AdminReviewTargetType.choices)
    target_id = models.CharField(max_length=64)
    action = models.CharField(max_length=64)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["target_type", "target_id"])]

    def __str__(self) -> str:
        return f"AdminReviewLog<{self.admin_id}:{self.target_type}:{self.action}:{self.target_id}>"
