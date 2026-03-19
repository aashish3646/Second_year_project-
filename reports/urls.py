from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStatsViewSet, PublicStatsViewSet

router = DefaultRouter()
router.register(r'stats', AdminStatsViewSet, basename='admin-stats')
router.register(r'public-stats', PublicStatsViewSet, basename='public-stats')

urlpatterns = [
    path('', include(router.urls)),
]
