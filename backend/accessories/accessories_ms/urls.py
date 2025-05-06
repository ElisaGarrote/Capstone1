from django.urls import path
from .views import *

urlpatterns = [
    path('accessories/', get_accessories, name='all_accessories'),
]
