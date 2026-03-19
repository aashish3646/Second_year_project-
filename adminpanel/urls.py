from django.urls import path

from .views import AdminOverviewView, AdminReviewLogListView

urlpatterns = [
    path("overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("review-logs/", AdminReviewLogListView.as_view(), name="admin-review-logs"),
]

