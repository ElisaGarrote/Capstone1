from django.contrib import admin
from django.urls import path, include
from auth_service.urls import health_check

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('', include('auth_service.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
