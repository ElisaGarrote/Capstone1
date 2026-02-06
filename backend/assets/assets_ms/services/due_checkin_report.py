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
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger(__name__)

# Contexts service base URL
CONTEXTS_SERVICE_URL = getattr(
    settings, 
    'CONTEXTS_SERVICE_URL', 
    'http://localhost:8002'
)

# Auth service base URL
AUTH_SERVICE_URL = getattr(
    settings,
    'AUTH_API_URL',
    'http://localhost:8001'
)


def get_ticket_by_id(ticket_id):
    """Fetch ticket details from contexts service."""
    try:
        url = f"{CONTEXTS_SERVICE_URL}/tickets/{ticket_id}/"
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        logger.error(f"Error fetching ticket {ticket_id}: {str(e)}")
        return None


def get_employee_details(employee_id):
    """Fetch employee details from Help Desk service via contexts proxy."""
    if not employee_id:
        return None
    
    cache_key = f"helpdesk:employee:{employee_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    try:
        url = f"{CONTEXTS_SERVICE_URL}/helpdesk-employees/{employee_id}/"
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            # Cache for 10 minutes to reduce repeated calls
            cache.set(cache_key, data, 600)
            return data
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
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            # Cache for 10 minutes to reduce repeated calls
            cache.set(cache_key, data, 600)
            return data
        return None
    except Exception as e:
        logger.error(f"Error fetching location {location_id}: {str(e)}")
        return None


def fetch_employees_batch(employee_ids):
    """
    Fetch multiple employee details concurrently.
    Returns a dictionary mapping employee_id -> employee_data.
    """
    if not employee_ids:
        return {}
    
    employee_map = {}
    uncached_ids = []
    
    # Check cache first
    for emp_id in employee_ids:
        if emp_id:
            cache_key = f"helpdesk:employee:{emp_id}"
            cached = cache.get(cache_key)
            if cached:
                employee_map[emp_id] = cached
            else:
                uncached_ids.append(emp_id)
    
    # Fetch uncached employees concurrently
    if uncached_ids:
        def fetch_single_employee(emp_id):
            try:
                url = f"{CONTEXTS_SERVICE_URL}/helpdesk-employees/{emp_id}/"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    cache_key = f"helpdesk:employee:{emp_id}"
                    cache.set(cache_key, data, 600)
                    return (emp_id, data)
            except Exception as e:
                logger.warning(f"Error fetching employee {emp_id}: {str(e)}")
            return (emp_id, None)
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_single_employee, emp_id) for emp_id in uncached_ids]
            for future in as_completed(futures):
                emp_id, data = future.result()
                if data:
                    employee_map[emp_id] = data
    
    return employee_map


def fetch_locations_batch(location_ids):
    """
    Fetch multiple location details concurrently.
    Returns a dictionary mapping location_id -> location_data.
    """
    if not location_ids:
        return {}
    
    location_map = {}
    uncached_ids = []
    
    # Check cache first
    for loc_id in location_ids:
        if loc_id:
            cache_key = f"helpdesk:location:{loc_id}"
            cached = cache.get(cache_key)
            if cached:
                location_map[loc_id] = cached
            else:
                uncached_ids.append(loc_id)
    
    # Fetch uncached locations concurrently
    if uncached_ids:
        def fetch_single_location(loc_id):
            try:
                url = f"{CONTEXTS_SERVICE_URL}/helpdesk-locations/{loc_id}/"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    cache_key = f"helpdesk:location:{loc_id}"
                    cache.set(cache_key, data, 600)
                    return (loc_id, data)
            except Exception as e:
                logger.warning(f"Error fetching location {loc_id}: {str(e)}")
            return (loc_id, None)
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_single_location, loc_id) for loc_id in uncached_ids]
            for future in as_completed(futures):
                loc_id, data = future.result()
                if data:
                    location_map[loc_id] = data
    
    return location_map


def fetch_users_batch(user_ids):
    """
    Fetch multiple user details from auth service concurrently.
    Returns a dictionary mapping user_id -> user_data.
    """
    if not user_ids:
        return {}
    
    user_map = {}
    uncached_ids = []
    
    # Check cache first
    for user_id in user_ids:
        if user_id:
            cache_key = f"auth:user:{user_id}"
            cached = cache.get(cache_key)
            if cached:
                user_map[user_id] = cached
            else:
                uncached_ids.append(user_id)
    
    # Fetch uncached users concurrently
    if uncached_ids:
        def fetch_single_user(user_id):
            try:
                url = f"{AUTH_SERVICE_URL}/users/{user_id}/"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    cache_key = f"auth:user:{user_id}"
                    cache.set(cache_key, data, 600)
                    return (user_id, data)
            except Exception as e:
                logger.warning(f"Error fetching user {user_id}: {str(e)}")
            return (user_id, None)
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_single_user, user_id) for user_id in uncached_ids]
            for future in as_completed(futures):
                user_id, data = future.result()
                if data:
                    user_map[user_id] = data
    
    return user_map


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
    
    # Find all checkouts that don't have a corresponding checkin and are due within the timeframe
    due_checkouts = AssetCheckout.objects.filter(
        return_date__lte=future_date,  # Return date is within the next month
        asset_checkin__isnull=True  # No check-in recorded yet
    ).select_related('asset', 'asset__product').order_by('return_date')
    
    # Collect all unique employee, user, and location IDs
    employee_ids = set()
    user_ids = set()
    location_ids = set()
    
    for checkout in due_checkouts:
        if checkout.checkout_to:
            employee_ids.add(checkout.checkout_to)
        if checkout.created_by:
            user_ids.add(checkout.created_by)
        if checkout.location:
            location_ids.add(checkout.location)
    
    # Batch fetch all employees, users, and locations concurrently
    logger.info(f"Fetching {len(employee_ids)} employees, {len(user_ids)} users, and {len(location_ids)} locations in batch...")
    employee_map = fetch_employees_batch(list(employee_ids))
    user_map = fetch_users_batch(list(user_ids))
    location_map = fetch_locations_batch(list(location_ids))
    logger.info(f"Batch fetch complete. Got {len(employee_map)} employees, {len(user_map)} users, and {len(location_map)} locations.")
    
    report_data = []
    
    for checkout in due_checkouts:
        # Get asset details
        asset = checkout.asset
        asset_display = f"{asset.asset_id} - {asset.product.name}"
        
        # Calculate days until due (negative if overdue, positive if upcoming)
        days_until_due = (checkout.return_date - today).days
        status = 'overdue' if days_until_due < 0 else 'upcoming'
        
        # Get the employee who has the asset (CHECKED OUT TO) from batch-fetched data
        checked_out_to_name = None
        checked_out_to_id = checkout.checkout_to
        
        if checkout.checkout_to and checkout.checkout_to in employee_map:
            checked_out_to = employee_map[checkout.checkout_to]
            if checked_out_to:
                # Handle different response structures from Help Desk service
                if isinstance(checked_out_to, dict):
                    # Check if it's wrapped in an 'employee' key
                    if checked_out_to.get('employee'):
                        emp = checked_out_to['employee']
                        checked_out_to_name = f"{emp.get('first_name', '')} {emp.get('middle_name', '')} {emp.get('last_name', '')} {emp.get('suffix', '')}".strip()
                    # Or if first_name/last_name are at the top level (snake_case)
                    elif checked_out_to.get('first_name') or checked_out_to.get('last_name'):
                        checked_out_to_name = f"{checked_out_to.get('first_name', '')} {checked_out_to.get('middle_name', '')} {checked_out_to.get('last_name', '')} {checked_out_to.get('suffix', '')}".strip()
                    # Or if firstName/lastName are at the top level (camelCase)
                    elif checked_out_to.get('firstName') or checked_out_to.get('lastName'):
                        checked_out_to_name = f"{checked_out_to.get('firstName', '')} {checked_out_to.get('middleName', '')} {checked_out_to.get('lastName', '')} {checked_out_to.get('suffix', '')}".strip()
        
        # Get the user who created the checkout (from centralized auth service)
        checked_out_by_name = "System"
        if checkout.created_by and checkout.created_by in user_map:
            user = user_map[checkout.created_by]
            if user and isinstance(user, dict):
                # Extract user name from auth service response
                checked_out_by_name = user.get('fullname') or f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or f"User {checkout.created_by}"
        
        # Get location details from batch-fetched data
        location_name = None
        location_id = checkout.location
        if checkout.location and checkout.location in location_map:
            location = location_map[checkout.location]
            if location and isinstance(location, dict):
                # Extract location name from various possible structures
                location_name = (
                    location.get('name') or 
                    location.get('display_name') or 
                    location.get('city') or 
                    None
                )
        
        report_data.append({
            'checkout_id': checkout.id,
            'asset_db_id': asset.id,  # Database ID for navigation
            'asset_id': asset.asset_id,
            'asset_name': asset.product.name,
            'asset_display': asset_display,
            'checked_out_by': checked_out_by_name or 'Unknown',
            'checked_out_to': checked_out_to_name or 'Unknown',
            'checked_out_to_id': checked_out_to_id,  # Store the employee ID for frontend
            'checkout_date': checkout.checkout_date,
            'return_date': checkout.return_date,
            'days_until_due': days_until_due,
            'status': status,
            'ticket_number': checkout.ticket_number,
            'location_id': location_id,
            'location': location_name  # Location name for display
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
