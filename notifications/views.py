from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


def _is_admin(user) -> bool:
    return bool(
        user
        and user.is_authenticated
        and (user.is_staff or user.is_superuser or getattr(user, 'role', None) == 'admin')
    )


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if _is_admin(self.request.user) and self.request.query_params.get('all') == '1':
            return Notification.objects.all()
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationsReadView(APIView):
    """
    POST /api/notifications/mark-read

    Body:
    - { "all": true }
    - OR { "ids": [1,2,3] }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get('ids')
        mark_all = bool(request.data.get('all'))

        qs = Notification.objects.filter(user=request.user)
        if mark_all:
            updated = qs.filter(is_read=False).update(is_read=True)
            return Response({'updated': updated}, status=status.HTTP_200_OK)

        if not isinstance(ids, list) or not ids:
            return Response(
                {'detail': 'Provide {"all": true} or {"ids": [..]}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = qs.filter(id__in=ids).update(is_read=True)
        return Response({'updated': updated}, status=status.HTTP_200_OK)


def create_notification(user, notification_type, title, message, link=None):
    Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def notify_admins(notification_type, title, message, link=None):
    """
    Sends a notification to all users with admin role, staff status, or superuser status.
    """
    from django.contrib.auth import get_user_model
    from django.db.models import Q

    User = get_user_model()
    # Find all admins, staff, and superusers
    admins = User.objects.filter(
        Q(role='admin') | Q(is_staff=True) | Q(is_superuser=True)
    ).distinct()

    for admin in admins:
        create_notification(
            user=admin,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link
        )
