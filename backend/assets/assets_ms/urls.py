from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api.supplier import SupplierDetailProxy, SupplierListProxy
from .api.contexts import (
    CategoryDetailProxy,
    ManufacturerDetailProxy,
    DepreciationDetailProxy,
)
from .views import *

router = DefaultRouter()
router.register('products', ProductViewSet, basename='categories')
router.register('assets', AssetViewSet, basename='assets')
router.register('asset-checkout', AssetCheckoutViewSet, basename='asset-checkout')
router.register('asset-checkin', AssetCheckinViewSet, basename='asset-checkin')
router.register('components', ComponentViewSet, basename='components')
router.register('component-checkout', ComponentCheckoutViewSet, basename='component-checkout')
router.register('component-checkin', ComponentCheckinViewSet, basename='component-checkin')
router.register('audit-schedule', AuditScheduleViewSet, basename='audit-schedule')
router.register('audits', AuditViewSet, basename='audits')
router.register('repairs', RepairViewSet, basename='repair')
router.register('audit-files', AuditFileViewSet, basename='audit-files')
router.register('dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    # Internal cross-service usage checks
    path("suppliers/<int:pk>/check-usage/", check_supplier_usage, name="check-supplier-usage"),
    path("manufacturers/<int:pk>/check-usage/", check_manufacturer_usage, name="check-manufacturer-usage"),
    path("depreciations/<int:pk>/check-usage/", check_depreciation_usage, name="check-depreciation-usage"),

    # Proxy endpoints for external Contexts resources
    path("contexts/suppliers/", SupplierListProxy.as_view(), name="proxy-supplier-list"),
    path("contexts/suppliers/<int:pk>/", SupplierDetailProxy.as_view(), name="proxy-supplier-detail"),
    path("contexts/categories/<int:pk>/", CategoryDetailProxy.as_view(), name="proxy-category-detail"),
    path("contexts/manufacturers/<int:pk>/", ManufacturerDetailProxy.as_view(), name="proxy-manufacturer-detail"),
    path("contexts/depreciations/<int:pk>/", DepreciationDetailProxy.as_view(), name="proxy-depreciation-detail"),

    path("", include(router.urls)),
]
