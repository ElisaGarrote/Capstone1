from django.urls import path
from .views import *

urlpatterns = [
    path('accessories/', get_accessories, name='all_accessories'),
    path('accessories/delete/<int:id>', soft_delete_accessory, name='delete_accessory'),
]
