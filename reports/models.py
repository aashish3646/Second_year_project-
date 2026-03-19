from __future__ import annotations

from django.conf import settings
from django.db import models


class ReportTargetType(models.TextChoices):
    SELLER = "seller", "Seller"
    AUCTION = "auction", "Auction"
    BID = "bid", "Bid"
    PAYMENT = "payment", "Payment"
    USER = "user", "User"


class ReportStatus(models.TextChoices):
    OPEN = "open", "Open"
    UNDER_REVIEW = "under_review", "Under review"
    RESOLVED = "resolved", "Resolved"
    REJECTED = "rejected", "Rejected"


class ReportReason(models.TextChoices):
    FAKE_SELLER = "fake_seller", "Fake seller"
    FAKE_BIDDING = "fake_bidding", "Fake bidding"
    SUSPICIOUS_OWNERSHIP = "suspicious_ownership", "Suspicious ownership"
    PAYMENT_DISPUTE = "payment_dispute", "Payment dispute"
    OTHER = "other", "Other"


class Report(models.Model):
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    target_type = models.CharField(max_length=20, choices=ReportTargetType.choices)
    target_id = models.CharField(max_length=64)
    reason = models.CharField(max_length=40, choices=ReportReason.choices)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=ReportStatus.choices, default=ReportStatus.OPEN)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="handled_reports",
    )
    handled_at = models.DateTimeField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["target_type", "target_id", "status"])]

    def __str__(self) -> str:
        return f"Report<{self.id}:{self.target_type}:{self.reason}:{self.status}>"
