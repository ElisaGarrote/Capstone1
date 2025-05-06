from django.urls import path
from .views import *

urlpatterns = [
    path('products/', get_products, name='all_products'),
    path('products/registration/', create_product, name='add_new_product'),
    path('products/<int:id>/', get_product_by_id, name='product_details_of_id'),
    path('depreciations/product_registration', get_product_depreciations, name='depreciation_names'),
]
