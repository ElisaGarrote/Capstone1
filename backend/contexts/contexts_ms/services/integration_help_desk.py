import os
from requests.exceptions import RequestException
from .http_client import get as client_get, patch as client_patch
from django.core.cache import cache
from django.conf import settings


# Centralized Help Desk service helper module
# Use settings.HELPDESK_API_URL which should point to the external Help Desk service API
# The URL should include the /api/ prefix (e.g., http://165.22.247.50:5001/api/)
BASE_URL = getattr(settings, "HELPDESK_API_URL", os.getenv("HELPDESK_API_URL", "http://165.22.247.50:5001/api/"))

# Cache settings
LOCATION_CACHE_TTL = 300
LOCATION_WARNING_TTL = 60
LIST_CACHE_TTL = 300
LIST_WARNING_TTL = 60


def _build_url(path):
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"


def fetch_resource_by_id(resource_name, resource_id):
    """Fetch a single resource by name and id. Returns dict or warning dict."""
    if not resource_id:
        return None
    # HELPDESK_API_URL already includes /api/ prefix (e.g., http://165.22.247.50:5001/api/)
    url = _build_url(f"{resource_name}/{resource_id}/")
    try:
        resp = client_get(url, timeout=6)
        if resp.status_code == 404:
            return {"warning": f"{resource_name[:-1].capitalize()} {resource_id} not found or deleted."}
        resp.raise_for_status()
        return resp.json()
    except RequestException:
        return {"warning": "Help Desk service unreachable. Make sure the Help Desk service is running and accessible."}

def get_location_by_id(location_id):
    """Fetch a location resource from the Contexts service by ID with caching.

    Caches successful lookups for LOCATION_CACHE_TTL seconds. If the
    Contexts service returns a warning dict (unreachable or 404), cache it
    for a short period to avoid hammering the remote service.
    """
    if not location_id:
        return None
    key = f"contexts:location:{location_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('locations', location_id)
    # If result is a warning dict, cache for a short time
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, LOCATION_WARNING_TTL)
    else:
        cache.set(key, result, LOCATION_CACHE_TTL)
    return result


def get_employee_by_id(employee_id):
    """Fetch an employee resource from the Help Desk service by ID with caching."""
    if not employee_id:
        return None
    key = f"contexts:employee:{employee_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('employees', employee_id)
    # If result is a warning dict, cache for a short time
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, LOCATION_WARNING_TTL)
    else:
        cache.set(key, result, LOCATION_CACHE_TTL)
    return result


def fetch_resource_list(resource_name, params=None):
    """Fetch a list endpoint from the Help Desk service."""
    params = params or {}
    # HELPDESK_API_URL already includes /api/ prefix
    url = _build_url(f"{resource_name}/")
    try:
        resp = client_get(url, params=params, timeout=8)
        if resp.status_code == 404:
            return {"warning": f"{resource_name} endpoint not found."}
        resp.raise_for_status()
        data = resp.json()
        # If remote returns pagination object with results, return as-is
        if isinstance(data, dict) and 'results' in data:
            return data
        return data
    except RequestException:
        return {"warning": "Help Desk service unreachable. Make sure the Help Desk service is running and accessible."}


def get_locations_list(q=None, limit=50):
    key = f"contexts:list:locations:{q}:{limit}"
    cached = cache.get(key)
    if cached is not None:
        return cached
    params = {}
    if q:
        params['q'] = q
    if limit:
        params['limit'] = limit
    result = fetch_resource_list('locations', params=params)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, LIST_WARNING_TTL)
    else:
        cache.set(key, result, LIST_CACHE_TTL)
    return result