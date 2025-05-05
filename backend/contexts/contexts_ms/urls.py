from django.urls import path
from .views import *

urlpatterns = [
    path('product/', get_product_contexts, name='all_suppliers_categories_manufacturers_name'),
    path('suppliers/', get_suppliers, name='all_suppliers'),
    path('supplier/registration/', create_supplier, name='add_new_supplier'), 
    path('categories/', get_categories, name='all_categories'),
    path('categories/registration/', create_category, name='add_new_category'), 
    path('manufacturers/', get_manufacturers, name='all_manufacturers'),
    path('manufacturers/registration/', create_manufacturer, name='add_new_manufacturer'), 
]
