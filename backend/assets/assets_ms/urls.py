from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('repairs', RepairViewSet, basename='repair')

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
router.register('dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = router.urls
