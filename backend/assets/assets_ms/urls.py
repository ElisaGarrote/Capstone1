from django.urls import path
from .views import *

urlpatterns = [
    path('all-products/', get_products, name='get_products'),
    path('create-product/', create_product, name='create_product')
]
