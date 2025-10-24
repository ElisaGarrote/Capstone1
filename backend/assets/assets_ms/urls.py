from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('products', ProductViewSet, basename='categories')
router.register('assets', AssetViewSet, basename='assets')
router.register('asset-checkout', AssetCheckoutViewSet, basename='asset-checkout')
router.register('asset-checkin', AssetCheckinViewSet, basename='asset-checkin')
router.register('components', ComponentViewSet, basename='components')
router.register('component-checkout', ComponentCheckoutViewSet, basename='component-checkout')
router.register('component-checkin', ComponentCheckinViewSet, basename='component-checkin')
urlpatterns = router.urls
