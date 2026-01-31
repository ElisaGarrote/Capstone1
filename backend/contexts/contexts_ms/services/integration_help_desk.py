import os
from requests.exceptions import RequestException
from .http_client import get as client_get
from django.conf import settings

# Base URL for Help Desk service
# Must include /api/ prefix, e.g., http://165.22.247.50:5001/api/
BASE_URL = getattr(
    settings,
    "HELPDESK_API_URL",
    os.getenv("HELPDESK_API_URL", "http://165.22.247.50:5001/api/")
)

def _build_url(path: str) -> str:
    """Construct full URL for the given resource path."""
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"

def fetch_resource_by_id(resource_name: str, resource_id):
    """
    Fetch a single resource by name and ID from the Help Desk service.
    Returns a dict, or {'warning': ...} if unreachable or not found.
    """
    if not resource_id:
        return None

    url = _build_url(f"{resource_name}/{resource_id}/")
    try:
        resp = client_get(url, timeout=6)
        if resp.status_code == 404:
            return {"warning": f"{resource_name[:-1].capitalize()} {resource_id} not found."}
        resp.raise_for_status()
        return resp.json()
    except RequestException:
        return {"warning": "Help Desk service unreachable."}

def fetch_resource_list(resource_name: str, params=None):
    """
    Fetch a list endpoint from the Help Desk service.
    Returns a dict or list depending on the API response.
    """
    params = params or {}
    url = _build_url(f"{resource_name}/")
    try:
        resp = client_get(url, params=params, timeout=8)
        if resp.status_code == 404:
            return {"warning": f"{resource_name} endpoint not found."}
        resp.raise_for_status()
        return resp.json()
    except RequestException:
        return {"warning": "Help Desk service unreachable."}

def get_location_by_id(location_id):
    """
    Fetch a single location by ID.
    Returns the location object, or {'warning': ...} if error.
    """
    if not location_id:
        return None

    result = fetch_resource_by_id("locations", location_id)

    # Pass through warnings
    if isinstance(result, dict) and result.get("warning"):
        return result

    # Extract location object if API response uses {success, location}
    if isinstance(result, dict) and result.get("success") and "location" in result:
        return result["location"]

    # Otherwise return raw result
    return result

def get_locations_list(q=None, limit=50):
    """
    Fetch list of locations.
    Returns a list of location objects, or {'warning': ...} if error.
    """
    params = {}
    if q:
        params["q"] = q
    if limit:
        params["limit"] = limit

    result = fetch_resource_list("locations", params=params)

    # If API returns {success, locations: [...]}, extract array
    if isinstance(result, dict):
        if result.get("warning"):
            return result
        if "locations" in result:
            return result["locations"]

    # If API returned a list directly, return it
    return result
