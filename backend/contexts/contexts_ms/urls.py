from django.urls import path
from .views import *

urlpatterns = [
    path('manufacturers/names/', get_manaufacturers_names, name='all_manufacturers_name'),


    path('names/', get_contexts_names, name='all_suppliers_manufacturers_name'),
    #path('product/', get_context_names, name='all_suppliers_categories_manufacturers_name'),
    path('suppliers/', get_suppliers, name='all_suppliers'),
    path('supplier/registration/', create_supplier, name='add_new_supplier'), 
    path('manufacturers/', get_manufacturers, name='all_manufacturers'),
    path('manufacturer/registration/', create_manufacturer, name='add_new_manufacturer'), 
]