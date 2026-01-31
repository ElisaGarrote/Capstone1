import os
from requests.exceptions import RequestException
from .http_client import get as client_get
from django.conf import settings

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
        resp = client_get(url, timeout=6)
        if resp.status_code == 404:
            return {"warning": f"Employee {employee_id} not found."}
        resp.raise_for_status()
        data = resp.json()
        if data.get("success") and data.get("employee"):
            return data["employee"]
        return data
    except RequestException:
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