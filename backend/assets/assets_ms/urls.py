from django.urls import path
from .views import *

urlpatterns = [
    path('products/', get_products, name='all_products'),
    path('products/<int:id>/', get_product_by_id, name='product_details_of_id'),
    path('depreciations/', get_depreciations, name='all_depreciations'),
]
