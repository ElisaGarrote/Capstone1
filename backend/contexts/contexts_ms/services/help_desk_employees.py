import os
import logging
from requests.exceptions import RequestException
from .http_client import get as client_get
from django.conf import settings

logger = logging.getLogger(__name__)

BASE_URL = getattr(
    settings,
    "HELPDESK_EMPLOYEE_API_URL",
    os.getenv("HELPDESK_EMPLOYEE_API_URL", "http://165.22.247.50:8003/api/v1/hdts/"),
)

def _build_url(path: str) -> str:
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"

def get_employee_by_id(employee_id):
    """Fetch a single employee by ID."""
    if not employee_id:
        return None

    url = _build_url(f"employees/{employee_id}/")
    try:
        logger.info(f"Fetching employee from: {url}")
        resp = client_get(url, timeout=6)
        logger.info(f"Employee API response status: {resp.status_code}")
        
        if resp.status_code == 404:
            logger.warning(f"Employee {employee_id} not found (404)")
            return {"warning": f"Employee {employee_id} not found."}
        
        resp.raise_for_status()
        data = resp.json()
        logger.info(f"Employee API response data: {data}")
        
        if data.get("success") and data.get("employee"):
            logger.info(f"Returning employee data: {data['employee']}")
            return data["employee"]
        
        logger.warning(f"Unexpected response structure: {data}")
        return data
    except RequestException as e:
        logger.error(f"Failed to fetch employee {employee_id}: {str(e)}")
        return {"warning": "Help Desk employee service unreachable."}

def get_employees_list(q=None, limit=None):
    """Fetch employees list."""
    params = {}
    if q:
        params["q"] = q
    if limit:
        params["limit"] = limit

    url = _build_url("employees/list/")
    try:
        resp = client_get(url, params=params, timeout=8)
        if resp.status_code == 404:
            return {"warning": "Employees endpoint not found."}
        resp.raise_for_status()
        return resp.json()
    except RequestException:
        return {"warning": "Help Desk employee service unreachable."}