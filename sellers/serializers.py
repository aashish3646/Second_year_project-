from __future__ import annotations

from rest_framework import serializers

from .models import (
    DocumentType,
    IntendedItemCategory,
    SellerApplication,
    SellerApplicationStatusEvent,
    SellerProfile,
    SellerType,
    SellerVerificationStatus,
    VerificationDocument,
)
from .rules import all_document_types, required_document_types


class SellerRequirementsSerializer(serializers.Serializer):
    seller_type = serializers.ChoiceField(choices=SellerType.choices)
    intended_item_categories = serializers.ListField(
        child=serializers.ChoiceField(choices=IntendedItemCategory.choices),
        allow_empty=False,
    )

    required_document_types = serializers.ListField(child=serializers.ChoiceField(choices=DocumentType.choices), read_only=True)
    all_document_types = serializers.ListField(child=serializers.ChoiceField(choices=DocumentType.choices), read_only=True)

    def validate(self, attrs):
        seller_type = attrs["seller_type"]
        cats = attrs["intended_item_categories"]
        attrs["required_document_types"] = sorted(required_document_types(seller_type=seller_type, intended_item_categories=cats))
        attrs["all_document_types"] = sorted(all_document_types(seller_type=seller_type, intended_item_categories=cats))
        return attrs


class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = ["id", "document_type", "file", "metadata", "status", "remarks", "uploaded_at"]
        read_only_fields = ["id", "status", "remarks", "uploaded_at"]


class SellerApplicationSerializer(serializers.ModelSerializer):
    documents = VerificationDocumentSerializer(many=True, read_only=True)
    required_document_types = serializers.SerializerMethodField()

    class Meta:
        model = SellerApplication
        fields = [
            "id",
            "user",
            "seller_type",
            "intended_item_categories",
            "phone",
            "email",
            "full_name_or_business_name",
            "address",
            "city",
            "country",
            "payout_details",
            "submission_notes",
            "status",
            "admin_remarks",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "updated_at",
            "documents",
            "required_document_types",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "admin_remarks",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "updated_at",
            "documents",
        ]

    def get_required_document_types(self, obj: SellerApplication):
        return sorted(required_document_types(seller_type=obj.seller_type, intended_item_categories=obj.intended_item_categories))

    def validate_intended_item_categories(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("Select at least one intended item category.")
        return value

    def validate(self, attrs):
        # Ensure duplicate active applications are not created.
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if request and request.method == "POST" and user and user.is_authenticated:
            active_exists = SellerApplication.objects.filter(
                user=user,
                status__in=[
                    SellerVerificationStatus.PENDING_REVIEW,
                    SellerVerificationStatus.UNDER_VERIFICATION,
                    SellerVerificationStatus.NEEDS_MORE_DOCUMENTS,
                ],
            ).exists()
            if active_exists:
                raise serializers.ValidationError("You already have an active seller application.")
        return attrs


class SellerApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerApplication
        fields = [
            "phone",
            "email",
            "full_name_or_business_name",
            "address",
            "city",
            "country",
            "payout_details",
            "submission_notes",
            "intended_item_categories",
        ]

    def validate(self, attrs):
        app: SellerApplication = self.instance
        if app.status not in {SellerVerificationStatus.NEEDS_MORE_DOCUMENTS, SellerVerificationStatus.REJECTED}:
            raise serializers.ValidationError("This application cannot be updated in the current status.")
        return attrs


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "user",
            "seller_type",
            "business_name",
            "phone",
            "email",
            "address",
            "city",
            "country",
            "verification_status",
            "admin_notes",
            "verified_at",
            "suspended_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class SellerApplicationStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerApplicationStatusEvent
        fields = ["id", "from_status", "to_status", "actor", "remarks", "created_at"]
        read_only_fields = fields

