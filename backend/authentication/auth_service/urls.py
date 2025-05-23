from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset, api_test

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')

urlpatterns = [
    path('test/', api_test, name='api-test'),
    path('', include(router.urls)),
]
