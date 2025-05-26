from django.urls import path
from .views import *

urlpatterns = [
    # Products
    path('products/', get_all_products, name='all_products'),
    path('products/contexts/', get_product_contexts, name='product_registration_contexts'),
    path('products/<int:id>/', get_product_by_id, name='product_details_of_product.id'),
    path('products/registration/', create_product, name='add_new_product'),
    path('products/<int:id>/update/', update_product, name='update_product'),
    path('products/<int:id>/delete/', soft_delete_product, name='delete_product'),
    path('products/names/all/', get_product_names, name='product_names'),
    
    # Assets
    path('assets/', get_all_assets, name='all_assets'),
    path('assets/contexts/', get_asset_contexts, name='asset_registration_contexts'),
    path('assets/<int:id>/delete/', soft_delete_asset, name='delete_asset'),

    # Audits
    path('audits/create/', create_audit, name='create_audit'),
    path('audits/add/files/', add_audit_file, name='add_audit_file'),
    path('audits/all/', get_all_audit, name='get_all_audit'),
    path('audits/all/files', get_all_audit_files, name='get_all_audit_files'),
    path('audits/create-schedule/', create_audit_schedule, name='create_audit_schedule'),
    path('audits/get/edit/schedule/<int:id>/', get_edit_audit_schedule_by_id, name='get_edit_audit_schedule_by_id'),
    path('audits/all/schedules/', get_all_audit_schedules, name='get_all_audit_schedule'),

    # Component
    path('component/create/', create_component, name='create_component'),

    # Status
    path('status/create/', create_status, name='create_status'),
    path('status/get/edit/status/<int:id>/', get_edit_status_by_id, name='get_edit_status_by_id'),
    path('status/all/', get_all_status, name='get_all_status'),
]
