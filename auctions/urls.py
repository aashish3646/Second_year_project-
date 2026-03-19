from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AuctionViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'', AuctionViewSet, basename='auctions')

urlpatterns = [
    path('', include(router.urls)),
]
