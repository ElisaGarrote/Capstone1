from django.urls import path
from .views import *

urlpatterns = [
    path('accessories/', get_accessories, name='all_accessories'),
    path('accessories/registration', create_accessory, name='add_new_accessory'),
    path('accessories/<int:id>', get_accessory_by_id, name='accessory_details_of_id'),
    path('accessories/delete/<int:id>', soft_delete_accessory, name='delete_accessory'),
    path('accessories/categories', get_categories, name='all_accessory_categories'),
]