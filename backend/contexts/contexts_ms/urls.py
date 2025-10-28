from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('depreciations', DepreciationViewSet, basename='depreciation')
router.register('manufacturers', ManufacturerViewSet, basename='manufacturer')

urlpatterns = [
    path('', include(router.urls)),
    path('names/', get_contexts_names, name='all_suppliers_manufacturers_name'),
    #path('api/suppliers/<int:supplier_id>/', get_supplier_details, name='get_supplier_details'),
    # Manufacturer names endpoint (custom)
    path('manufacturers/names/', get_manaufacturers_names, name='all_manufacturers_name'),
    # The CRUD endpoints for manufacturers are provided by the registered viewset
    # via the DefaultRouter (router.register('manufacturers', ManufacturerViewSet, ...)).
    # If you remove the function-based views (get/put/delete), be sure to also
    # remove any urlpatterns that reference them to avoid NameError on import.

    path('locations/', get_all_location, name='all_locations'),
    path('tickets/', get_all_tickets, name='all_locations'),
    path('tickets/<str:ticket_id>/resolve/', resolve_ticket, name='resolve_ticket'),
]