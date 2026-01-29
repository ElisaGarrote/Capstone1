"""
Notification service for generating system alerts.

This module generates notifications based on various conditions:
1. Low stock products - products with minimum_quantity set where available assets <= minimum
2. Low stock components - components with minimum_quantity set where available <= minimum
3. Expired/expiring warranties - assets with warranty_expiration on or before today
4. Overdue asset returns - asset checkouts without checkin past return_date
5. Overdue audits - audit schedules without audits past the scheduled date
"""

from datetime import date, timedelta
from django.db.models import Count, Q, Exists, OuterRef
from django.utils import timezone
from assets_ms.models import (
    Product, Asset, Component, AssetCheckout, AssetCheckin, 
    AuditSchedule, Audit
)
from assets_ms.services.contexts import get_status_by_id, get_statuses_list
from assets_ms.services.integration_help_desk import get_user_names
from django.core.cache import cache
import hashlib


def get_user_by_id(user_id):
    """
    Get user info by ID from the cached user list.
    Returns dict with user info or None if not found.
    """
    if not user_id:
        return None
    users = get_user_names()
    for user in users:
        if user.get('id') == user_id:
            return user
    return None


def get_deployable_pending_status_ids():
    """
    Get all status IDs that are 'deployable' or 'pending' type.
    These statuses represent assets that are available/counted toward stock.
    """
    cache_key = "notifications:deployable_pending_status_ids"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    statuses = get_statuses_list(limit=100)
    if isinstance(statuses, dict) and statuses.get('warning'):
        # If contexts service is unreachable, return empty - skip product notifications
        return []
    
    # Handle paginated or list response
    if isinstance(statuses, dict) and 'results' in statuses:
        statuses = statuses['results']
    
    # Filter for deployable and pending types
    valid_ids = [
        s['id'] for s in statuses 
        if s.get('type') in ('deployable', 'pending') and not s.get('is_deleted', False)
    ]
    cache.set(cache_key, valid_ids, 300)  # Cache for 5 minutes
    return valid_ids


def generate_low_stock_product_notifications():
    """
    Generate notifications for products where available assets are below minimum_quantity.

    Available assets = total assets - assets with status NOT in (deployable, pending)
    Only check products where minimum_quantity is set and > 0 (null or 0 means no watching).
    """
    notifications = []
    today = timezone.now()
    
    # Get status IDs that count as "available"
    available_status_ids = get_deployable_pending_status_ids()
    if not available_status_ids:
        return notifications  # Can't determine statuses, skip
    
    # Get products with minimum_quantity > 0
    products = Product.objects.filter(is_deleted=False, minimum_quantity__gt=0)
    
    for product in products:
        # Count assets with deployable or pending status
        available_count = Asset.objects.filter(
            product=product,
            is_deleted=False,
            status__in=available_status_ids
        ).count()
        
        if available_count <= product.minimum_quantity:
            notifications.append({
                'id': f"product-low-stock-{product.id}",
                'type': 'low-stock-product',
                'title': 'Low Stock - Product',
                'message': f"There's {available_count} {product.name} available, which is at or below the minimum of {product.minimum_quantity}.",
                'item_type': 'product',
                'item_id': product.id,
                'item_name': product.name,
                'created_at': today.isoformat(),
            })
    
    return notifications


def generate_low_stock_component_notifications():
    """
    Generate notifications for components where available_quantity <= minimum_quantity.
    Only check components where minimum_quantity is set and > 0 (null or 0 means no watching).
    """
    notifications = []
    today = timezone.now()
    
    # Get components with minimum_quantity > 0
    components = Component.objects.filter(is_deleted=False, minimum_quantity__gt=0)
    
    for component in components:
        available = component.available_quantity
        if available <= component.minimum_quantity:
            notifications.append({
                'id': f"component-low-stock-{component.id}",
                'type': 'low-stock-component',
                'title': 'Low Stock - Component',
                'message': f"Component '{component.name}' has {available} available, which is at or below the minimum of {component.minimum_quantity}.",
                'item_type': 'component',
                'item_id': component.id,
                'item_name': component.name,
                'created_at': today.isoformat(),
            })
    
    return notifications


def generate_warranty_expiration_notifications():
    """
    Generate notifications for assets with warranty expiration on or before today.
    """
    notifications = []
    today = date.today()
    
    # Get assets with expired or expiring warranty
    expired_assets = Asset.objects.filter(
        is_deleted=False,
        warranty_expiration__lte=today
    ).select_related('product')
    
    for asset in expired_assets:
        product_name = asset.product.name if asset.product else 'Unknown Product'
        asset_name = asset.name or asset.asset_id
        
        if asset.warranty_expiration == today:
            message = f"Warranty for Asset {asset.asset_id} ({product_name}) expires today."
        else:
            days_ago = (today - asset.warranty_expiration).days
            message = f"Warranty for Asset {asset.asset_id} ({product_name}) expired {days_ago} days ago."
        
        notifications.append({
            'id': f"warranty-expired-{asset.id}",
            'type': 'expiring',
            'title': 'Warranty Expired',
            'message': message,
            'item_type': 'asset',
            'item_id': asset.id,
            'item_name': asset.asset_id,
            'created_at': timezone.now().isoformat(),
        })

    return notifications


def generate_overdue_checkout_notifications():
    """
    Generate notifications for asset checkouts without checkin where today is past return_date.
    """
    notifications = []
    today = date.today()

    # Get checkouts without checkin that are overdue
    # Using filter with asset_checkin__isnull=True to find checkouts without a related checkin
    overdue_checkouts = AssetCheckout.objects.filter(
        return_date__lt=today,
        asset_checkin__isnull=True  # Only those without a checkin
    ).select_related('asset', 'asset__product')

    for checkout in overdue_checkouts:
        asset = checkout.asset
        product_name = asset.product.name if asset.product else 'Unknown Product'
        days_overdue = (today - checkout.return_date).days

        # Try to get user info
        user_info = get_user_by_id(checkout.checkout_to)
        user_name = "Unknown User"
        if user_info and isinstance(user_info, dict) and not user_info.get('warning'):
            user_name = user_info.get('fullname') or user_info.get('email') or f"User #{checkout.checkout_to}"

        notifications.append({
            'id': f"overdue-checkout-{checkout.id}",
            'type': 'due-back',
            'title': 'Asset Overdue',
            'message': f"Asset {asset.asset_id} ({product_name}) was due back from {user_name} {days_overdue} day(s) ago.",
            'item_type': 'asset_checkout',
            'item_id': checkout.id,
            'item_name': asset.asset_id,
            'created_at': timezone.now().isoformat(),
        })

    return notifications


def generate_overdue_audit_notifications():
    """
    Generate notifications for audit schedules without audits where today is past the scheduled date.
    """
    notifications = []
    today = date.today()

    # Get audit schedules without audits that are overdue
    # Using filter with audit__isnull=True to find schedules without a related audit
    overdue_schedules = AuditSchedule.objects.filter(
        is_deleted=False,
        date__lt=today,
        audit__isnull=True  # Only those without an audit
    ).select_related('asset', 'asset__product')

    for schedule in overdue_schedules:
        asset = schedule.asset
        product_name = asset.product.name if asset.product else 'Unknown Product'
        days_overdue = (today - schedule.date).days

        notifications.append({
            'id': f"overdue-audit-{schedule.id}",
            'type': 'maintenance',
            'title': 'Overdue Audit',
            'message': f"Audit for Asset {asset.asset_id} ({product_name}) was scheduled for {schedule.date.strftime('%b %d, %Y')} and is {days_overdue} day(s) overdue.",
            'item_type': 'audit_schedule',
            'item_id': schedule.id,
            'item_name': asset.asset_id,
            'created_at': timezone.now().isoformat(),
        })

    return notifications


def get_all_notifications():
    """
    Collect all notifications from all sources.
    Returns a list of notification dictionaries sorted by creation time (newest first).
    """
    notifications = []

    # Collect from all sources
    notifications.extend(generate_low_stock_product_notifications())
    notifications.extend(generate_low_stock_component_notifications())
    notifications.extend(generate_warranty_expiration_notifications())
    notifications.extend(generate_overdue_checkout_notifications())
    notifications.extend(generate_overdue_audit_notifications())

    # Sort by created_at descending (newest first)
    notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    return notifications
