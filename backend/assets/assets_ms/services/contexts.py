import os
import requests
from requests.exceptions import RequestException
from django.core.cache import cache
from django.conf import settings

# Centralized Contexts service helper module
# Use settings.CONTEXTS_API_URL or fallback to the default service host
BASE_URL = getattr(settings, "CONTEXTS_API_URL", os.getenv("CONTEXTS_API_URL", "http://contexts-service:8003/"))

# Cache settings
SUPPLIERS_LIST_CACHE_KEY = "external_suppliers_list"
SUPPLIERS_CACHE_TTL = 300  # 5 minutes
LOCATION_CACHE_TTL = 300
STATUS_CACHE_TTL = 300
LOCATION_WARNING_TTL = 60
STATUS_WARNING_TTL = 60
SUPPLIER_ITEM_CACHE_TTL = 300
CATEGORY_CACHE_TTL = 300
MANUFACTURER_CACHE_TTL = 300
DEPRECIATION_CACHE_TTL = 300
SUPPLIER_WARNING_TTL = 60
CATEGORY_WARNING_TTL = 60
MANUFACTURER_WARNING_TTL = 60
DEPRECIATION_WARNING_TTL = 60

def _build_url(path):
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"

def fetch_suppliers_from_remote():
    """Try known supplier list endpoints. Returns JSON list or None on failure."""
    # Try the /api/ prefix first (some Contexts deployments use that), fall back to bare /suppliers/
    for path in ("api/suppliers/", "suppliers/"):
        url = _build_url(path)
        try:
            resp = requests.get(url, timeout=8)
            resp.raise_for_status()
            return resp.json()
        except RequestException:
            continue
    return None

def fetch_resource_by_id(resource_name, resource_id):
    """Fetch a single resource by name and id. Returns dict or warning dict."""
    if not resource_id:
        return None
    url = _build_url(f"{resource_name}/{resource_id}/")
    try:
        resp = requests.get(url, timeout=6)
        if resp.status_code == 404:
            return {"warning": f"{resource_name[:-1].capitalize()} {resource_id} not found or deleted."}
        resp.raise_for_status()
        return resp.json()
    except RequestException:
        return {"warning": "Contexts service unreachable. Make sure 'contexts-service' is running and accessible."}

# Public helpers
def get_suppliers(force_refresh=False):
    if not force_refresh:
        cached = cache.get(SUPPLIERS_LIST_CACHE_KEY)
        if cached is not None:
            return cached
    suppliers = fetch_suppliers_from_remote()
    if suppliers is None:
        return None
    cache.set(SUPPLIERS_LIST_CACHE_KEY, suppliers, SUPPLIERS_CACHE_TTL)
    return suppliers

def get_supplier_by_id(supplier_id):
    """Fetch supplier by ID with caching."""
    if not supplier_id:
        return None
    key = f"contexts:supplier:{supplier_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('suppliers', supplier_id)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, SUPPLIER_WARNING_TTL)
    else:
        cache.set(key, result, SUPPLIER_ITEM_CACHE_TTL)
    return result

def get_category_by_id(category_id):
    """Fetch category by ID with caching."""
    if not category_id:
        return None
    key = f"contexts:category:{category_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('categories', category_id)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, CATEGORY_WARNING_TTL)
    else:
        cache.set(key, result, CATEGORY_CACHE_TTL)
    return result

def get_manufacturer_by_id(manufacturer_id):
    """Fetch manufacturer by ID with caching."""
    if not manufacturer_id:
        return None
    key = f"contexts:manufacturer:{manufacturer_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('manufacturers', manufacturer_id)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, MANUFACTURER_WARNING_TTL)
    else:
        cache.set(key, result, MANUFACTURER_CACHE_TTL)
    return result

def get_depreciation_by_id(depreciation_id):
    """Fetch depreciation by ID with caching."""
    if not depreciation_id:
        return None
    key = f"contexts:depreciation:{depreciation_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('depreciations', depreciation_id)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, DEPRECIATION_WARNING_TTL)
    else:
        cache.set(key, result, DEPRECIATION_CACHE_TTL)
    return result

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

def get_status_by_id(status_id):
    """Fetch a status resource from the Contexts service by ID with caching.

    Same caching strategy as locations.
    """
    if not status_id:
        return None
    key = f"contexts:status:{status_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = fetch_resource_by_id('statuses', status_id)
    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, STATUS_WARNING_TTL)
    else:
        cache.set(key, result, STATUS_CACHE_TTL)
    return result
