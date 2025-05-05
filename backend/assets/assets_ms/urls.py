from django.urls import path
from .views import *

urlpatterns = [
    path('products/', get_products, name='all_products'),
]
