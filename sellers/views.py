from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from adminpanel.models import AdminReviewLog

from .models import (
    SellerApplication,
    SellerApplicationStatusEvent,
    SellerProfile,
    SellerVerificationStatus,
    VerificationDocument,
)
from .permissions import IsAdmin, is_admin
from .rules import required_document_types
from notifications.views import notify_admins
from .serializers import (
    SellerApplicationSerializer,
    SellerApplicationStatusEventSerializer,
    SellerApplicationUpdateSerializer,
    SellerProfileSerializer,
    SellerRequirementsSerializer,
    VerificationDocumentSerializer,
)


class SellerRequirementsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SellerRequirementsSerializer

    def post(self, request, *args, **kwargs):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        return Response(s.validated_data, status=status.HTTP_200_OK)


class SellerApplicationViewSet(viewsets.ModelViewSet):
    queryset = SellerApplication.objects.select_related("user", "reviewed_by").prefetch_related("documents", "status_events")
    serializer_class = SellerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return SellerApplicationUpdateSerializer
        return SellerApplicationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if is_admin(self.request.user):
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        app = serializer.save(user=self.request.user)
        notify_admins(
            notification_type='admin_alert',
            title='New Seller Application',
            message=f"User {self.request.user.username} has applied to become a seller.",
            link=f"/dashboard/admin/seller-applications/{app.id}"
        )

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        app = (
            SellerApplication.objects.filter(user=request.user)
            .select_related("reviewed_by")
            .prefetch_related("documents", "status_events")
            .order_by("-created_at")
            .first()
        )
        if not app:
            return Response({"detail": "No seller application found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(SellerApplicationSerializer(app, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="documents")
    def upload_document(self, request, pk=None):
        app = self.get_object()
        if not (is_admin(request.user) or app.user_id == request.user.id):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        serializer = VerificationDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        VerificationDocument.objects.create(
            application=app,
            document_type=serializer.validated_data["document_type"],
            file=serializer.validated_data["file"],
            metadata=serializer.validated_data.get("metadata", {}),
        )
        return Response({"detail": "Uploaded."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="status-events")
    def status_events(self, request, pk=None):
        app = self.get_object()
        events = app.status_events.all()
        return Response(SellerApplicationStatusEventSerializer(events, many=True).data, status=status.HTTP_200_OK)


class SellerProfileMeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SellerProfileSerializer

    def get_object(self):
        profile = SellerProfile.objects.filter(user=self.request.user).first()
        if not profile:
            raise generics.exceptions.NotFound("Seller profile not found.")
        return profile


class AdminSellerApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SellerApplication.objects.select_related("user", "reviewed_by").prefetch_related("documents", "status_events")
    serializer_class = SellerApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @action(detail=True, methods=["post"], url_path="review")
    def review(self, request, pk=None):
        app: SellerApplication = self.get_object()
        action = request.data.get("action")
        remarks = request.data.get("remarks", "")

        allowed = {
            "approve": SellerVerificationStatus.APPROVED,
            "reject": SellerVerificationStatus.REJECTED,
            "needs_more_documents": SellerVerificationStatus.NEEDS_MORE_DOCUMENTS,
            "under_verification": SellerVerificationStatus.UNDER_VERIFICATION,
            "suspend": SellerVerificationStatus.SUSPENDED,
        }
        if action not in allowed:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        next_status = allowed[action]

        # Backend enforcement: cannot approve if required documents missing.
        if next_status == SellerVerificationStatus.APPROVED:
            required = required_document_types(
                seller_type=app.seller_type,
                intended_item_categories=app.intended_item_categories,
            )
            submitted = set(app.documents.values_list("document_type", flat=True))
            missing = sorted(required - submitted)
            if missing:
                return Response(
                    {"detail": "Missing required verification documents.", "missing_document_types": missing},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            prev = app.status
            app.status = next_status
            app.admin_remarks = remarks
            app.reviewed_by = request.user
            app.reviewed_at = timezone.now()
            app.save(update_fields=["status", "admin_remarks", "reviewed_by", "reviewed_at", "updated_at"])

            SellerApplicationStatusEvent.objects.create(
                application=app,
                from_status=prev,
                to_status=next_status,
                actor=request.user,
                remarks=remarks,
            )

            AdminReviewLog.objects.create(
                admin=request.user,
                target_type="seller_application",
                target_id=str(app.id),
                action=action,
                remarks=remarks,
            )

            # Sync SellerProfile + User flags
            profile, _ = SellerProfile.objects.get_or_create(
                user=app.user,
                defaults={
                    "seller_type": app.seller_type,
                    "business_name": None,
                    "phone": app.phone,
                    "email": app.email,
                    "address": app.address,
                    "city": app.city,
                    "country": app.country,
                    "verification_status": next_status,
                },
            )
            profile.seller_type = app.seller_type
            profile.phone = app.phone
            profile.email = app.email
            profile.address = app.address
            profile.city = app.city
            profile.country = app.country
            profile.verification_status = next_status

            user = app.user

            if next_status == SellerVerificationStatus.APPROVED:
                profile.verified_at = timezone.now()
                profile.suspended_at = None
                # Mark the user as a verified seller for both old and new flags
                user.is_verified_seller = True
                user.is_verified = True
                user.role = "seller"
                user.save(update_fields=["is_verified_seller", "is_verified", "role"])
            elif next_status == SellerVerificationStatus.SUSPENDED:
                profile.suspended_at = timezone.now()
                user.is_verified_seller = False
                user.save(update_fields=["is_verified_seller"])
            else:
                # For other transitions, keep is_verified_seller / is_verified in sync.
                if user.is_verified_seller or user.is_verified:
                    user.is_verified_seller = False
                    user.is_verified = False
                    user.save(update_fields=["is_verified_seller", "is_verified"])

            profile.save()

        return Response(SellerApplicationSerializer(app, context={"request": request}).data, status=status.HTTP_200_OK)

from django.shortcuts import render

# Create your views here.
