from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from .views import *

def health_check(request):
    return JsonResponse({"status": "ok"})

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('users', UsersViewset, basename='users')
urlpatterns = router.urls
