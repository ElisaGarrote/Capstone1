from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api_root'),
    # Add your other URL patterns here
]


