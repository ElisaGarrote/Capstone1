from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('depreciations', DepreciationViewSet, basename='depreciation')

urlpatterns = [
    path('', include(router.urls)),
    path('names/', get_contexts_names, name='all_suppliers_manufacturers_name'),
    path('api/suppliers/<int:supplier_id>/', get_supplier_details, name='get_supplier_details'),
    path('manufacturers/names/', get_manaufacturers_names, name='all_manufacturers_name'),
    path('manufacturers/<int:id>/name', get_manu_name_by_id, name='manufacturer name by id'),
    path('manufacturers/', get_all_manufacturers, name='all_manufacturers'),
    path('manufacturers/<int:id>/', get_manufacturer_by_id, name='get_manufacturer_by_id'),
    path('manufacturers/registration/', create_manufacturer, name='add_new_manufacturer'),
    path('manufacturers/<int:id>/update/', update_manufacturer, name='update_manufacturer_by_id'),
    path('manufacturers/<int:id>/delete/', soft_delete_manufacturer, name='soft_delete_manufacturer_by_id'),

    path('locations/', get_all_location, name='all_locations'),
    path('tickets/', get_all_tickets, name='all_locations'),
    path('tickets/<str:ticket_id>/resolve/', resolve_ticket, name='resolve_ticket'),
]