from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categorpies')
router.register('tickets', TicketViewSet, basename='tickets')
urlpatterns = router.urls
