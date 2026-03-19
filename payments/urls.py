from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentMethodViewSet,
    PaymentTransactionViewSet,
    PaymentViewSet,
)

router = DefaultRouter(trailing_slash=True)
router.register(r"methods", PaymentMethodViewSet, basename="payment-methods")
router.register(r"transactions", PaymentTransactionViewSet, basename="payment-transactions")
router.register(r"", PaymentViewSet, basename="payments")

urlpatterns = [
    path('', include(router.urls)),
]
