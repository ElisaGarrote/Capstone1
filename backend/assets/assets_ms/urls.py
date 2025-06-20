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
    path('assets/<int:id>/', get_asset_by_id, name='asset_details_of_asset.id'),
    path('assets/registration/', create_asset, name='add_new_asset'),
    path('assets/<int:id>/update/', update_asset, name='update_asset'),
    path('assets/<int:id>/delete/', soft_delete_asset, name='delete_asset'),
    path('assets/<int:id>/defaults/', get_product_defaults, name='product_defaults'),
    path('assets/next-id/', get_next_asset_id, name='get_next_asset_id'),

    # Asset Checkouts
    path('assets/check-out/', get_all_asset_checkouts, name='all_asset_checkouts'),
    path('assets/check-out/<int:id>/', get_asset_checkout_by_id, name='asset_checkout_details_by_id'),
    path('assets/check-out/registration/', create_asset_checkout, name='asset_checkout_registration'),

    # Asset Checkins
    #path('assets/check-in/', get_all_asset_checkouts, name='all_asset_checkouts'),
    #path('assets/check-in/<int:id>/', get_asset_checkout_by_id, name='asset_checkout_details_by_id'),
    path('assets/check-in/registration/', create_asset_checkin, name='asset_checkin_registration'),

    # Asset Category
    path('assets/categories/', get_all_category, name='get_all_asset_category'),
    path('assets/categories/<int:id>/', get_category_by_id, name='get_asset_category_by_id'),
    path('assets/categories/registration/', create_category, name='asset_category_registration'),
    path('assets/categories/<int:id>/update/', update_category, name='update_asset_category_by_id'),
    path('assets/categories/<int:id>/delete/', soft_delete_category, name='soft_delete_asset_category_by_id'),

    # Audits
    path('audits/create/', create_audit, name='create_audit'),
    path('audits/get/edit/<int:id>/', get_edit_audit_by_id, name='get_edit_audit_by_id'),
    path('audits/all/', get_all_audit, name='get_all_audit'),

    # Audits Files
    path('audits/add/files/', add_audit_file, name='add_audit_file'),
    path('audits/all/files', get_all_audit_files, name='get_all_audit_files'),
    path('audits/file/<int:id>/delete/', soft_delete_audit_files, name='soft_delete_audit_files'),

    # Audits Schedule
    path('audits/create-schedule/', create_audit_schedule, name='create_audit_schedule'),
    path('audits/get/edit/schedule/<int:id>/', get_edit_audit_schedule_by_id, name='get_edit_audit_schedule_by_id'),
    path('audits/all/schedules/', get_all_audit_schedules, name='get_all_audit_schedule'),
    path('audits/schedule/<int:id>/delete/', soft_delete_schedule_audit, name='soft_delete_schedule_audit'),

    # Status
    path('status/create/', create_status, name='create_status'),
    path('status/get/edit/status/<int:id>/', get_edit_status_by_id, name='get_edit_status_by_id'),
    path('status/all/', get_all_status, name='get_all_status'),

    # Depreciation
    path('depreciations/', get_all_depreciation, name='get_all_depreciations'),
    path('depreciations/<int:id>/', get_depreciation_by_id, name='get_depreciation_by_id'),
    path('depreciations/registration/', create_depreciation, name='depreciation_registration'),
    path('depreciations/<int:id>/update/', update_depreciation, name='update_depreciation_by_id'),
    path('depreciations/<int:id>/delete/', soft_delete_depreciation, name='soft_delete_depreciation_by_id'),

    # Component
    path('components/', get_all_components, name='all_components'),
    path('components/<int:id>/', get_component_by_id, name='get_component_by_id'),
    path('components/registration/', create_component, name='add_new_component'),
    path('components/<int:id>/update/', update_component, name='update_component_by_id'),
    path('components/<int:id>/delete/', soft_delete_component, name='soft_delete_component_by_id'),
]
