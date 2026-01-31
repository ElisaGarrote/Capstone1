"""
Due for Check-in Report Service

This module provides functionality to generate a report of assets that are overdue for check-in.
The report includes assets that have been checked out with a return date that has passed,
but have not yet been checked in.
"""
import requests
from datetime import date
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Contexts service base URL
CONTEXTS_SERVICE_URL = getattr(
    settings, 
    'CONTEXTS_SERVICE_URL', 
    'http://localhost:8002'
)


def get_ticket_by_id(ticket_id):
    """Fetch ticket details from contexts service."""
    try:
        url = f"{CONTEXTS_SERVICE_URL}/tickets/{ticket_id}/"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logger.error(f"Error fetching ticket {ticket_id}: {str(e)}")
        return None


def get_employee_details(employee_id):
    """Fetch employee details from Help Desk service via contexts proxy."""
    if not employee_id:
        logger.warning(f"get_employee_details called with empty employee_id")
        return None
    
    cache_key = f"helpdesk:employee:{employee_id}"
    cached = cache.get(cache_key)
    if cached:
        logger.info(f"Employee {employee_id} found in cache")
        return cached
    
    try:
        url = f"{CONTEXTS_SERVICE_URL}/helpdesk-employees/{employee_id}/"
        logger.info(f"Fetching employee from URL: {url}")
        response = requests.get(url, timeout=5)
        logger.info(f"Employee {employee_id} response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Employee {employee_id} response data: {data}")
            # Cache for 5 minutes
            cache.set(cache_key, data, 300)
            return data
        else:
            logger.warning(f"Employee {employee_id} returned status {response.status_code}: {response.text}")
        return None
    except Exception as e:
        logger.error(f"Error fetching employee {employee_id}: {str(e)}")
        return None


def get_location_details(location_id):
    """Fetch location details from Help Desk service via contexts proxy."""
    if not location_id:
        return None
    
    cache_key = f"helpdesk:location:{location_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{CONTEXTS_SERVICE_URL}/helpdesk-locations/{location_id}/"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            # Cache for 5 minutes
            cache.set(cache_key, data, 300)
            return data
        return None
    except Exception as e:
        logger.error(f"Error fetching location {location_id}: {str(e)}")
        return None


def get_due_checkin_report(days_threshold=30):
    """
    Generate a report of assets that are due for check-in within the specified timeframe.
    
    Args:
        days_threshold: Number of days in the future to include (default: 30)
    
    Returns a list of dictionaries containing:
    - asset_id: The asset ID
    - asset_name: The asset name (product name)
    - checked_out_by: Employee who initiated the checkout ticket
    - checked_out_to: Employee who has the asset
    - checkout_date: Date the asset was checked out
    - return_date: Expected return date (due date)
    - days_until_due: Negative if overdue, positive if upcoming
    - status: 'overdue' or 'upcoming'
    """
    from assets_ms.models import AssetCheckout, Asset
    from datetime import timedelta
    
    today = date.today()
    future_date = today + timedelta(days=days_threshold)
    report_data = []
    
    # Find all checkouts that don't have a corresponding checkin and are due within the timeframe
    due_checkouts = AssetCheckout.objects.filter(
        return_date__lte=future_date,  # Return date is within the next month
        asset_checkin__isnull=True  # No check-in recorded yet
    ).select_related('asset', 'asset__product').order_by('return_date')
    
    for checkout in due_checkouts:
        # Get asset details
        asset = checkout.asset
        asset_display = f"{asset.asset_id} - {asset.product.name}"
        
        # Calculate days until due (negative if overdue, positive if upcoming)
        days_until_due = (checkout.return_date - today).days
        status = 'overdue' if days_until_due < 0 else 'upcoming'
        
        # Get the employee who has the asset (CHECKED OUT TO)
        checked_out_to_name = None
        logger.info(f"Processing checkout {checkout.id}: checkout_to={checkout.checkout_to}, ticket={checkout.ticket_number}")
        
        # Try to get employee name from ticket first (more reliable)
        ticket = get_ticket_by_id(checkout.ticket_number)
        if ticket:
            logger.info(f"Ticket {checkout.ticket_number} data: {ticket}")
            requestor_details = ticket.get('requestor_details')
            if requestor_details and isinstance(requestor_details, dict):
                checked_out_to_name = requestor_details.get('name') or f"{requestor_details.get('firstname', '')} {requestor_details.get('lastname', '')}".strip()
                if checked_out_to_name:
                    logger.info(f"Found employee name from ticket: {checked_out_to_name}")
        
        # Fallback: Try checkout.checkout_to (may not exist in Help Desk system)
        if not checked_out_to_name and checkout.checkout_to:
            checked_out_to = get_employee_details(checkout.checkout_to)
            if checked_out_to:
                # Handle different response structures from Help Desk service
                if isinstance(checked_out_to, dict):
                    # Check if it's wrapped in an 'employee' key
                    if checked_out_to.get('employee'):
                        emp = checked_out_to['employee']
                        checked_out_to_name = f"{emp.get('firstname', '')} {emp.get('lastname', '')}".strip()
                    # Or if firstname/lastname are at the top level
                    elif checked_out_to.get('firstname') or checked_out_to.get('lastname'):
                        checked_out_to_name = f"{checked_out_to.get('firstname', '')} {checked_out_to.get('lastname', '')}".strip()
        
        # Fallback: Try checkout.checkout_to (may not exist in Help Desk system)
        if not checked_out_to_name and checkout.checkout_to:
            checked_out_to = get_employee_details(checkout.checkout_to)
            if checked_out_to:
                # Handle different response structures from Help Desk service
                if isinstance(checked_out_to, dict):
                    # Check if it's wrapped in an 'employee' key
                    if checked_out_to.get('employee'):
                        emp = checked_out_to['employee']
                        checked_out_to_name = f"{emp.get('firstname', '')} {emp.get('lastname', '')}".strip()
                    # Or if firstname/lastname are at the top level
                    elif checked_out_to.get('firstname') or checked_out_to.get('lastname'):
                        checked_out_to_name = f"{checked_out_to.get('firstname', '')} {checked_out_to.get('lastname', '')}".strip()
                    if checked_out_to_name:
                        logger.info(f"Found employee name from Help Desk: {checked_out_to_name}")
        
        # Priority 2: Try to get from ticket requestor_details as fallback
        if not checked_out_to_name:
            ticket = get_ticket_by_id(checkout.ticket_number)
            if ticket:
                requestor_details = ticket.get('requestor_details')
                if requestor_details and isinstance(requestor_details, dict):
                    checked_out_to_name = requestor_details.get('name') or f"{requestor_details.get('firstname', '')} {requestor_details.get('lastname', '')}".strip()
        
        # For checked_out_by, use System as default
        checked_out_by_name = "System"
        
        report_data.append({
            'checkout_id': checkout.id,
            'asset_id': asset.asset_id,
            'asset_name': asset.product.name,
            'asset_display': asset_display,
            'checked_out_by': checked_out_by_name or 'Unknown',
            'checked_out_to': checked_out_to_name or 'Unknown',
            'checkout_date': checkout.checkout_date,
            'return_date': checkout.return_date,
            'days_until_due': days_until_due,
            'status': status,
            'ticket_number': checkout.ticket_number,
            'location_id': checkout.location
        })
    
    return report_data


def get_due_checkin_count():
    """
    Get the count of assets that are due for check-in within the next 30 days.
    """
    from assets_ms.models import AssetCheckout
    from datetime import timedelta
    
    today = date.today()
    future_date = today + timedelta(days=30)
    
    count = AssetCheckout.objects.filter(
        return_date__lte=future_date,
        asset_checkin__isnull=True
    ).count()
    
    return count
