"""
Activity Logger Service

Helper functions to log activity events to the ActivityLog model.
"""

from django.utils import timezone
from ..models import ActivityLog


def log_activity(
    activity_type: str,
    action: str,
    item_id: int,
    item_identifier: str = '',
    item_name: str = '',
    user_id: int = None,
    user_name: str = '',
    target_id: int = None,
    target_name: str = '',
    notes: str = '',
):
    """
    Create an ActivityLog entry.
    
    Args:
        activity_type: Type of entity (Asset, Component, Audit, Repair)
        action: Type of action (Create, Update, Delete, Checkout, Checkin, Schedule, Passed, Failed)
        item_id: ID of the affected item
        item_identifier: Display identifier of the item (e.g., asset_id, component serial)
        item_name: Name of the item
        user_id: ID of the user who performed the action
        user_name: Name of the user
        target_id: ID of the target (for checkout/checkin - employee/location)
        target_name: Name of the target
        notes: Additional notes about the activity
    
    Returns:
        The created ActivityLog instance
    """
    return ActivityLog.objects.create(
        datetime=timezone.now(),
        activity_type=activity_type,
        action=action,
        item_id=item_id,
        item_identifier=item_identifier or '',
        item_name=item_name or '',
        user_id=user_id,
        user_name=user_name or '',
        target_id=target_id,
        target_name=target_name or '',
        notes=notes or '',
    )


def log_asset_activity(
    action: str,
    asset,
    user_id: int = None,
    user_name: str = '',
    target_id: int = None,
    target_name: str = '',
    notes: str = '',
):
    """Log an activity for an Asset."""
    return log_activity(
        activity_type='Asset',
        action=action,
        item_id=asset.id,
        item_identifier=asset.displayed_id or asset.asset_id or str(asset.id),
        item_name=asset.name or '',
        user_id=user_id,
        user_name=user_name,
        target_id=target_id,
        target_name=target_name,
        notes=notes,
    )


def log_component_activity(
    action: str,
    component,
    user_id: int = None,
    user_name: str = '',
    target_id: int = None,
    target_name: str = '',
    notes: str = '',
):
    """Log an activity for a Component."""
    return log_activity(
        activity_type='Component',
        action=action,
        item_id=component.id,
        item_identifier=component.serial or str(component.id),
        item_name=component.name or '',
        user_id=user_id,
        user_name=user_name,
        target_id=target_id,
        target_name=target_name,
        notes=notes,
    )


def log_audit_activity(
    action: str,
    audit_or_schedule,
    asset=None,
    user_id: int = None,
    user_name: str = '',
    notes: str = '',
):
    """Log an activity for an Audit or AuditSchedule."""
    # Get asset from audit_schedule if not provided
    if asset is None:
        if hasattr(audit_or_schedule, 'asset'):
            asset = audit_or_schedule.asset
        elif hasattr(audit_or_schedule, 'audit_schedule'):
            asset = audit_or_schedule.audit_schedule.asset
    
    item_identifier = asset.displayed_id if asset else str(audit_or_schedule.id)
    item_name = f"Audit - {asset.name}" if asset else f"Audit {audit_or_schedule.id}"
    
    return log_activity(
        activity_type='Audit',
        action=action,
        item_id=audit_or_schedule.id,
        item_identifier=item_identifier,
        item_name=item_name,
        user_id=user_id,
        user_name=user_name,
        notes=notes,
    )


def log_repair_activity(
    action: str,
    repair,
    user_id: int = None,
    user_name: str = '',
    notes: str = '',
):
    """Log an activity for a Repair."""
    asset = repair.asset
    return log_activity(
        activity_type='Repair',
        action=action,
        item_id=repair.id,
        item_identifier=asset.displayed_id if asset else str(repair.id),
        item_name=repair.name or '',
        user_id=user_id,
        user_name=user_name,
        notes=notes,
    )

