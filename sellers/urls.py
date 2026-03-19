from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminSellerApplicationViewSet, SellerApplicationViewSet, SellerProfileMeView, SellerRequirementsView

router = DefaultRouter(trailing_slash=True)
router.register(r"applications", SellerApplicationViewSet, basename="seller-applications")

admin_router = DefaultRouter(trailing_slash=True)
admin_router.register(r"seller-applications", AdminSellerApplicationViewSet, basename="admin-seller-applications")

urlpatterns = [
    path("requirements/", SellerRequirementsView.as_view(), name="seller-requirements"),
    path("profile/me/", SellerProfileMeView.as_view(), name="seller-profile-me"),
    path("", include(router.urls)),
    path("admin/", include(admin_router.urls)),
]

