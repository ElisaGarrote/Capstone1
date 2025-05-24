from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('users', UsersViewset, basename='users')

urlpatterns = [
    path('test/', api_test, name='api-test'),
    path('', include(router.urls)),
]
