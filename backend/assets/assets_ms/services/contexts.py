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
    return fetch_resource_by_id('suppliers', supplier_id)

def get_category_by_id(category_id):
    return fetch_resource_by_id('categories', category_id)

def get_manufacturer_by_id(manufacturer_id):
    return fetch_resource_by_id('manufacturers', manufacturer_id)

def get_depreciation_by_id(depreciation_id):
    return fetch_resource_by_id('depreciations', depreciation_id)
