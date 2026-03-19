from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class SellerType(models.TextChoices):
    INDIVIDUAL = "individual", "Individual"
    BUSINESS = "business", "Business"
    CORPORATE = "corporate", "Corporate"


class IntendedItemCategory(models.TextChoices):
    GENERAL_GOODS = "general_goods", "General Goods"
    VEHICLES = "vehicles", "Vehicles"
    PROPERTY = "property", "Property / Real Estate"
    BUSINESS_INVENTORY = "business_inventory", "Business Inventory"
    LUXURY = "luxury", "Luxury / High Value Items"


class SellerVerificationStatus(models.TextChoices):
    PENDING_REVIEW = "pending_review", "Pending review"
    UNDER_VERIFICATION = "under_verification", "Under verification"
    NEEDS_MORE_DOCUMENTS = "needs_more_documents", "Needs more documents"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    SUSPENDED = "suspended", "Suspended"


class VerificationDocumentStatus(models.TextChoices):
    SUBMITTED = "submitted", "Submitted"
    ACCEPTED = "accepted", "Accepted"
    REJECTED = "rejected", "Rejected"
    NEEDS_REUPLOAD = "needs_reupload", "Needs reupload"


class DocumentType(models.TextChoices):
    # Identity / selfie
    CITIZENSHIP = "citizenship", "Citizenship"
    PASSPORT = "passport", "Passport"
    SELFIE = "selfie", "Selfie / Face verification"

    # Business / corporate
    BUSINESS_REGISTRATION = "business_registration", "Business registration certificate"
    COMPANY_REGISTRATION = "company_registration", "Company registration document"
    PAN_VAT = "pan_vat", "PAN / VAT document"
    AUTHORIZATION_LETTER = "authorization_letter", "Authorization letter"
    AUTH_REPRESENTATIVE_ID = "authorized_representative_id", "Authorized representative ID"

    # Vehicles
    VEHICLE_BLUEBOOK = "vehicle_bluebook", "Vehicle registration / Bluebook"
    TAX_CLEARANCE = "tax_clearance", "Tax clearance"

    # Property
    PROPERTY_OWNERSHIP = "property_ownership", "Ownership certificate"
    PROPERTY_LEGAL = "property_legal", "Property legal document"

    # Inventory / luxury
    INVOICE_SOURCE_PROOF = "invoice_source_proof", "Invoice / source proof"
    OWNERSHIP_PROOF = "ownership_proof", "Proof of ownership"
    AUTHENTICITY_PROOF = "authenticity_proof", "Authenticity proof"


class SellerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_profile",
    )
    seller_type = models.CharField(max_length=20, choices=SellerType.choices)
    business_name = models.CharField(max_length=255, blank=True, null=True)

    phone = models.CharField(max_length=32, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    country = models.CharField(max_length=120, blank=True, null=True)

    verification_status = models.CharField(
        max_length=32,
        choices=SellerVerificationStatus.choices,
        default=SellerVerificationStatus.PENDING_REVIEW,
    )
    admin_notes = models.TextField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    suspended_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"SellerProfile<{self.user_id}:{self.verification_status}>"


class SellerApplication(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_applications",
    )

    seller_type = models.CharField(max_length=20, choices=SellerType.choices)
    intended_item_categories = models.JSONField(default=list)  # list[str] of IntendedItemCategory values

    phone = models.CharField(max_length=32)
    email = models.EmailField()
    full_name_or_business_name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=120)
    country = models.CharField(max_length=120, default="Nepal")

    payout_details = models.JSONField(default=dict, blank=True)  # non-sensitive metadata only
    submission_notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=32,
        choices=SellerVerificationStatus.choices,
        default=SellerVerificationStatus.PENDING_REVIEW,
    )

    admin_remarks = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="reviewed_seller_applications",
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self) -> str:
        return f"SellerApplication<{self.id}:{self.user_id}:{self.status}>"

    @property
    def is_active_application(self) -> bool:
        return self.status in {
            SellerVerificationStatus.PENDING_REVIEW,
            SellerVerificationStatus.UNDER_VERIFICATION,
            SellerVerificationStatus.NEEDS_MORE_DOCUMENTS,
        }


class SellerApplicationStatusEvent(models.Model):
    application = models.ForeignKey(
        SellerApplication,
        on_delete=models.CASCADE,
        related_name="status_events",
    )
    from_status = models.CharField(max_length=32, choices=SellerVerificationStatus.choices, blank=True, null=True)
    to_status = models.CharField(max_length=32, choices=SellerVerificationStatus.choices)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="seller_status_events",
    )
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class VerificationDocument(models.Model):
    application = models.ForeignKey(
        SellerApplication,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_type = models.CharField(max_length=64, choices=DocumentType.choices)
    file = models.FileField(upload_to="verification_documents/%Y/%m/%d/")
    metadata = models.JSONField(default=dict, blank=True)

    status = models.CharField(
        max_length=32,
        choices=VerificationDocumentStatus.choices,
        default=VerificationDocumentStatus.SUBMITTED,
    )
    remarks = models.TextField(blank=True, null=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        unique_together = [("application", "document_type", "file")]

    def __str__(self) -> str:
        return f"VerificationDocument<{self.application_id}:{self.document_type}:{self.status}>"


def set_seller_profile_approved(profile: SellerProfile, *, admin_user, remarks: str | None = None) -> None:
    profile.verification_status = SellerVerificationStatus.APPROVED
    profile.verified_at = timezone.now()
    profile.suspended_at = None
    if remarks:
        profile.admin_notes = remarks
    profile.save(update_fields=["verification_status", "verified_at", "suspended_at", "admin_notes", "updated_at"])
