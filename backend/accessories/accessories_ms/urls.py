from django.urls import path
from .views import *

urlpatterns = [
    path('accessories/', get_accessories, name='all_accessories'),
    path('accessories/contexts/', get_accessory_contexts, name='accessory_registration_contexts'),
    path('accessories/names/', get_accessory_names, name='all_accessory_names'),
    path('accessories/registration/', create_accessory, name='add_new_accessory'),
    path('accessories/<int:id>/', get_accessory_by_id, name='get_accessory_by_id'),
    path('accessories/<int:id>/update/', update_accessory, name='update_accessory'),
    path('accessories/<int:id>/delete/', soft_delete_accessory, name='delete_accessory'),
    
    # Accessory Category
    path('accessories/categories/', get_all_category, name='get_all_accessory_category'),
    path('accessories/categories/<int:id>/', get_category_by_id, name='get_accessory_category_by_id'),
    path('accessories/categories/registration/', create_category, name='accessory_category_registration'),
    path('accessories/categories/<int:id>/update/', update_category, name='update_accessory_category_by_id'),
    path('accessories/categories/<int:id>/delete/', soft_delete_category, name='soft_delete_accessory_category_by_id'),

    # Accessory Checkout
    path('accessories/checkout/all/', get_all_accessory_checkout, name='get_all_accessory_checkout'),
    path('accessories/checkout/registration/', create_accessory_checkout, name='create_accessory_checkout'),

    # Accessory Checkin
    path('accessories/checkin/all/', get_all_accessory_checkin, name='get_all_accessory_checkin'),
    path('accessories/checkin/registration/', create_accessory_checkin, name='create_accessory_checkin'),
]