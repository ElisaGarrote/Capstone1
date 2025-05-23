from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewset, api_test

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')

urlpatterns = router.urls + [
    path('test/', api_test, name='api-test'),
]
