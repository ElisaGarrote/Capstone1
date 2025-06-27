from django.urls import path
from .views import *

urlpatterns = [
    path('names/', get_contexts_names, name='all_suppliers_manufacturers_name'),

    path('manufacturers/names/', get_manaufacturers_names, name='all_manufacturers_name'),
    path('manufacturers/<int:id>/name', get_manu_name_by_id, name='manufacturer name by id'),
    
    path('suppliers/names/', get_suppliers_names, name='all_suppliers_name'),
    path('suppliers/<int:id>/name', get_supp_name_by_id, name='supplier name by id'),
    
    path('suppliers/', get_all_suppliers, name='all_suppliers'),
    path('suppliers/<int:id>/', get_supplier_by_id, name='get_manufacturer_by_id'),
    path('suppliers/registration/', create_supplier, name='add_new_supplier'), 
    path('suppliers/<int:id>/update/', update_supplier, name='update_supplier_by_id'),
    path('suppliers/<int:id>/delete/', soft_delete_supplier, name='soft_delete_supplier_by_id'),

    path('manufacturers/', get_all_manufacturers, name='all_manufacturers'),
    path('manufacturers/<int:id>/', get_manufacturer_by_id, name='get_manufacturer_by_id'),
    path('manufacturers/registration/', create_manufacturer, name='add_new_manufacturer'),
    path('manufacturers/<int:id>/update/', update_manufacturer, name='update_manufacturer_by_id'),
    path('manufacturers/<int:id>/delete/', soft_delete_manufacturer, name='soft_delete_manufacturer_by_id'),

    path('locations/', get_all_location, name='all_locations'),
]