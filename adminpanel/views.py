from __future__ import annotations

from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework.response import Response

from auctions.models import Auction
from reports.models import Report, ReportStatus
from sellers.models import SellerApplication, SellerVerificationStatus

from sellers.permissions import IsAdmin

from .models import AdminReviewLog
from .serializers import AdminReviewLogSerializer


class AdminOverviewView(generics.GenericAPIView):
    """
    Lightweight admin dashboard overview.
    GET /api/admin/overview
    """

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        data = {
            "counts": {
                "seller_applications_pending_review": SellerApplication.objects.filter(
                    status=SellerVerificationStatus.PENDING_REVIEW
                ).count(),
                "seller_applications_active": SellerApplication.objects.filter(
                    status__in=[
                        SellerVerificationStatus.PENDING_REVIEW,
                        SellerVerificationStatus.UNDER_VERIFICATION,
                        SellerVerificationStatus.NEEDS_MORE_DOCUMENTS,
                    ]
                ).count(),
                "auctions_pending": Auction.objects.filter(status="pending").count(),
                "reports_open": Report.objects.filter(status=ReportStatus.OPEN).count(),
            },
            "seller_applications_by_status": dict(
                SellerApplication.objects.values_list("status")
                .annotate(c=Count("id"))
                .order_by()
                .values_list("status", "c")
            ),
        }
        return Response(data)


class AdminReviewLogListView(generics.ListAPIView):
    """
    GET /api/admin/review-logs?limit=20
    """

    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    serializer_class = AdminReviewLogSerializer

    def get_queryset(self):
        qs = AdminReviewLog.objects.select_related("admin").all()
        return qs

    def list(self, request, *args, **kwargs):
        limit = request.query_params.get("limit")
        try:
            limit_n = max(1, min(int(limit or 20), 200))
        except Exception:
            limit_n = 20
        qs = self.get_queryset()[:limit_n]
        return Response(self.get_serializer(qs, many=True).data)
