from django.urls import path
from .views import *

urlpatterns = [
    # Products
    path('all-products/', get_products, name='get_products'),
    path('create-product/', create_product, name='create_product'),

    # Assets
    path('create-asset/', create_asset, name='create_asset'),
    path('all-asset/', get_all_assets, name='get_all_assets'),

    # Audits
    path('audits/create/', create_audit, name='create_audit'),
    path('audits/add/files/', add_audit_file, name='add_audit_file'),
    path('audits/all/', get_all_audit, name='get_all_audit'),
    path('audits/all/files', get_all_audit_files, name='get_all_audit_files'),
    path('audits/create-schedule/', create_audit_schedule, name='create_audit_schedule'),
    path('audits/get/edit/schedule/<int:id>/', get_edit_audit_schedule_by_id, name='get_edit_audit_schedule_by_id'),
    path('audits/all/schedules/', get_all_audit_schedules, name='get_all_audit_schedule'),
]
