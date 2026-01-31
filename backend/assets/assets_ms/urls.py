from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api.supplier import SupplierDetailProxy, SupplierListProxy
from .api.contexts import *
from .views import *
from .api.reports import DepreciationReportAPIView, AssetReportAPIView, ActivityReportAPIView, ActivityReportSummaryAPIView, EoLWarrantyReportAPIView, UpcomingEoLReportAPIView
from .api.reports import DepreciationReportAPIView, AssetReportAPIView, ActivityReportAPIView, ActivityReportSummaryAPIView, EoLWarrantyReportAPIView, UpcomingEoLReportAPIView, ReachedEoLReportAPIView, ExpiredWarrantyReportAPIView, ExpiringWarrantyReportAPIView
from .api.notifications import NotificationsAPIView

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
router.register('audit-files', AuditFileViewSet, basename='audit-files')
router.register('repairs', RepairViewSet, basename='repair')
router.register('dashboard', DashboardViewSet, basename='dashboard')
router.register('report-templates', AssetReportTemplateViewSet, basename='report-templates')
router.register('due-checkin-report', DueCheckinReportViewSet, basename='due-checkin-report')

urlpatterns = [
    # Internal cross-service usage checks
    path("suppliers/<int:pk>/check-usage/", check_supplier_usage, name="check-supplier-usage"),
    path("manufacturers/<int:pk>/check-usage/", check_manufacturer_usage, name="check-manufacturer-usage"),
    path("depreciations/<int:pk>/check-usage/", check_depreciation_usage, name="check-depreciation-usage"),

    # Bulk usage check endpoint
    path("usage/check_bulk/", check_bulk_usage, name="check-bulk-usage"),

    # Proxy endpoints for external Contexts resources
    path("contexts/suppliers/", SupplierListProxy.as_view(), name="proxy-supplier-list"),
    path("contexts/suppliers/<int:pk>/", SupplierDetailProxy.as_view(), name="proxy-supplier-detail"),
    path("contexts/categories/", CategoryListProxy.as_view(), name="proxy-category-list"),
    path("contexts/categories/<int:pk>/", CategoryDetailProxy.as_view(), name="proxy-category-detail"),
    path("contexts/manufacturers/", ManufacturerListProxy.as_view(), name="proxy-manufacturer-list"),
    path("contexts/manufacturers/<int:pk>/", ManufacturerDetailProxy.as_view(), name="proxy-manufacturer-detail"),
    path("contexts/depreciations/", DepreciationListProxy.as_view(), name="proxy-depreciation-list"),
    path("contexts/depreciations/<int:pk>/", DepreciationDetailProxy.as_view(), name="proxy-depreciation-detail"),
    path("contexts/locations/", LocationListProxy.as_view(), name="proxy-location-list"),
    path("contexts/statuses/", StatusListProxy.as_view(), name="proxy-status-list"),

    # Proxy endpoints for external Ticket Tracking API
    path("tickets/asset/unresolved/", TicketUnresolvedListProxy.as_view(), name="proxy-tickets-unresolved"),
    path("tickets/asset/resolved/", TicketResolvedListProxy.as_view(), name="proxy-tickets-resolved"),
    path("external/ams/tickets/", ExternalAmsTicketsProxy.as_view(), name="proxy-external-ams-tickets"),

    path("reports/depreciation/", DepreciationReportAPIView.as_view(), name="depreciation-report"),
    path("reports/assets/", AssetReportAPIView.as_view(), name="asset-report"),
    path("reports/activity/", ActivityReportAPIView.as_view(), name="activity-report"),
    path("reports/activity/summary/", ActivityReportSummaryAPIView.as_view(), name="activity-report-summary"),
    path("reports/eol-warranty/", EoLWarrantyReportAPIView.as_view(), name="eol-warranty-report"),
    path("reports/expiring-warranty/", ExpiringWarrantyReportAPIView.as_view(), name="expiring-warranty-report"),
    path("reports/expired-warranty/", ExpiredWarrantyReportAPIView.as_view(), name="expired-warranty-report"),
    path("reports/reached-eol/", ReachedEoLReportAPIView.as_view(), name="reached-eol-report"),
    path("reports/upcoming-eol/", UpcomingEoLReportAPIView.as_view(), name="upcoming-eol-report"),

    # Notifications endpoint
    path("notifications/", NotificationsAPIView.as_view(), name="notifications"),

    path("", include(router.urls)),
    path("api/contexts/check-usage/supplier/<int:pk>/", check_supplier_usage, name="api-check-supplier-usage"),
    path("api/contexts/check-usage/depreciation/<int:pk>/", check_depreciation_usage, name="api-check-depreciation-usage"),
]
