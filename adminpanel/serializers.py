from __future__ import annotations

from rest_framework import serializers

from .models import AdminReviewLog


class AdminReviewLogSerializer(serializers.ModelSerializer):
    admin = serializers.SerializerMethodField()

    class Meta:
        model = AdminReviewLog
        fields = ["id", "admin", "target_type", "target_id", "action", "remarks", "created_at"]

    def get_admin(self, obj: AdminReviewLog) -> str:
        # Keep lightweight for dashboard display.
        return getattr(obj.admin, "username", str(obj.admin_id))

