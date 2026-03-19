from __future__ import annotations

from rest_framework import permissions


def is_admin(user) -> bool:
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser or getattr(user, "role", None) == "admin")
    )


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsVerifiedSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if is_admin(user):
            return True
        return bool(getattr(user, "is_verified_seller", False) or getattr(user, "role", None) == "seller")

