"""
URL configuration for the Bidverse project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse


def root_view(request):
        html = """
        <h1>Bidverse API</h1>
        <ul>
            <li><a href='/api/auth/me'>/api/auth/me</a></li>
            <li><a href='/api/auctions/'>/api/auctions/</a></li>
            <li><a href='/api/notifications/'>/api/notifications/</a></li>
            <li><a href='/api/payments/'>/api/payments/</a></li>
        </ul>
        """
        return HttpResponse(html)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', root_view),
    path('api/auth/', include('accounts.urls')),
    path('api/auctions/', include('auctions.urls')),
    path('api/bids/', include('bids.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/sellers/', include('sellers.urls')),
    path('api/admin/', include('adminpanel.urls')),
    path('api/reports/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
