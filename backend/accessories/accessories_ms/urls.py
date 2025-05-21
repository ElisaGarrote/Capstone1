from django.urls import path
from .views import *

urlpatterns = [
    path('accessories/', get_accessories, name='all_accessories'),
    path('accessories/<int:id>/', get_accessory_by_id, name='get_accessory_by_id'),
    path('accessories/registration', create_accessory, name='add_new_accessory'),
    path('accessories/<int:id>/update', update_accessory, name='update_accessory'),
    path('accessories/<int:id>/delete', soft_delete_accessory, name='delete_accessory'),
    path('accessories/category/', get_accessory_categories, name='all_accessory_categories'),
    path('accessories/category/registration', create_accessory_category, name='add_new_accessory_category'),
    path('accessories/category/<int:id>/update', update_accessory_category, name='update_accessory_category'),
    path('accessories/category/<int:id>/delete', soft_delete_accessory_category, name='delete_accessory_category'),
]