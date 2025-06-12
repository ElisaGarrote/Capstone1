from django.urls import path
from .views import *

urlpatterns = [
    # Consumables

    # Consumable Category
    path('consumables/categories/', get_all_category, name='get_all_consumable_category'),
    path('consumables/categories/<int:id>/', get_category_by_id, name='get_consumable_category_by_id'),
    path('consumables/categories/registration/', create_category, name='consumable_category_registration'),
    path('consumables/categories/<int:id>/update/', update_category, name='update_consumable_category_by_id'),
    path('consumables/categories/<int:id>/delete/', soft_delete_category, name='soft_delete_consumable_category_by_id'),
]