from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BidViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'', BidViewSet, basename='bids')

urlpatterns = [
    path('', include(router.urls)),
]
