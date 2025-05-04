from django.urls import path
from .views import *

urlpatterns = [
    path('all_category/', get_categories, name='get_categories'),
    path('category_registration/', create_category, name='create_category'),    
]
