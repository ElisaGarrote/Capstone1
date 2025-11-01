import os
import requests
from django.core.cache import cache
from django.conf import settings

# Get your Contexts service base URL from .env or default
BASE_URL = getattr(settings, "CONTEXTS_API_URL", os.getenv("CONTEXTS_API_URL", "http://contexts-service:8003"))
SUPPLIERS_LIST_CACHE_KEY = "external_suppliers_list"
SUPPLIERS_CACHE_TTL = 300  # cache 5 minutes

def fetch_suppliers_from_remote():
    """Fetch all suppliers from the external Contexts API."""
    url = f"{BASE_URL.rstrip('/')}/api/suppliers/"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None

def fetch_supplier_by_id_from_remote(supplier_id):
    """Fetch a specific supplier by ID."""
    url = f"{BASE_URL.rstrip('/')}/api/suppliers/{supplier_id}/"
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None

def get_suppliers(force_refresh=False):
    """Get all suppliers, cached for performance."""
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
    try:
        # ✅ use the actual Docker service name of the context service
        response = requests.get(f"http://contexts-service:8003/api/suppliers/{supplier_id}/", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise Exception(str(e))
