from django.urls import path
from .views import *

urlpatterns = [
    # Products
    #path('products/', get_products, name='all_products'),
    #path('products/registration/', create_product, name='add_new_product'),
    #path('products/<int:id>/', get_product_by_id, name='product_details_of_id'),
    #path('products/delete/<int:id>', soft_delete_product, name='delete_product'),
    #path('depreciations/product_registration', get_product_depreciations, name='depreciation_names'),
    # Assets
    path('create-asset/', create_asset, name='create_asset'),
    path('all-asset/', get_all_assets, name='get_all_assets'),

    # Audits
    path('audits/create/', create_audit, name='create_audit'),
    path('audits/all/', get_all_audit, name='get_all_audit'),
    path('audits/<int:id>/delete/', soft_delete_audit, name='soft_delete_audit'),

    # Audits Files
    path('audits/add/files/', add_audit_file, name='add_audit_file'),
    path('audits/all/files', get_all_audit_files, name='get_all_audit_files'),
    path('audits/file/<int:id>/delete/', soft_delete_audit_files, name='soft_delete_audit_files'),

    # Audits Schedule
    path('audits/create-schedule/', create_audit_schedule, name='create_audit_schedule'),
    path('audits/get/edit/schedule/<int:id>/', get_edit_audit_schedule_by_id, name='get_edit_audit_schedule_by_id'),
    path('audits/all/schedules/', get_all_audit_schedules, name='get_all_audit_schedule'),
    path('audits/schedule/<int:id>/delete/', soft_delete_schedule_audit, name='soft_delete_schedule_audit'),
    
    # Component
    path('component/create/', create_component, name='create_component'),

    # Status
    path('status/create/', create_status, name='create_status'),
    path('status/get/edit/status/<int:id>/', get_edit_status_by_id, name='get_edit_status_by_id'),
    path('status/all/', get_all_status, name='get_all_status'),
]