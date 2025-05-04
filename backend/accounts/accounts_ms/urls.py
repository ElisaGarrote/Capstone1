from django.urls import path
from .views import *

urlpatterns = [
    path('all-users/', get_users, name='get_users')
]
