from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path, include


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('depreciations', DepreciationViewSet, basename='depreciation')
router.register('manufacturers', ManufacturerViewSet, basename='manufacturer')
router.register('tickets', TicketViewSet, basename='tickets')
router.register('recycle-bin', RecycleBinViewSet, basename='recycle-bin')
urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
]