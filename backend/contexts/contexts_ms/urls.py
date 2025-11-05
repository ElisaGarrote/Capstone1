from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path, include
from contexts_ms.api.supplier_usage_api import *


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('depreciations', DepreciationViewSet, basename='depreciation')
router.register('manufacturers', ManufacturerViewSet, basename='manufacturer')
router.register('statuses', StatusViewSet, basename='status')
router.register('locations', LocationViewSet, basename='location')
router.register('tickets', TicketViewSet, basename='tickets')
router.register('recycle-bin', RecycleBinViewSet, basename='recycle-bin')
urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
    
    # supplier usage endpoints (assets/components lists by supplier)
    path('suppliers/<int:pk>/assets/', SupplierAssetListAPIView.as_view()),
    path('suppliers/<int:pk>/components/', SupplierComponentListAPIView.as_view()),
]