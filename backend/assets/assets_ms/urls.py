from django.urls import path
from .views import *

urlpatterns = [
    path('products/', get_products, name='all_products'),
    path('products/registration/', create_product, name='add_new_product'),
    path('products/<int:id>/', get_product_by_id, name='product_details_of_id'),
    path('depreciations/product_registration', get_product_depreciations, name='depreciation_names'),
    # Repair URLs
    path('repairs/', get_repairs, name='all_repairs'),
    path('repairs/<int:id>/', get_repair_by_id, name='repair_details'),
    path('repairs/create/', create_repair, name='create_repair'),
    path('repairs/update/<int:id>/', update_repair, name='update_repair'),
    path('repairs/delete/<int:id>/', delete_repair, name='delete_repair'),
    path('repairs/file/delete/<int:repair_id>/<int:file_id>/', delete_repair_file, name='delete_repair_file'),
    path('repairs/asset/<int:asset_id>/', get_repairs_by_asset, name='repairs_by_asset'),
]
