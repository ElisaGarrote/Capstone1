import os
from requests.exceptions import RequestException
from .http_client import get as client_get, post as client_post
from django.core.cache import cache
from django.conf import settings


# External Ticket Tracking API
# Base URL for the external ticket tracking service
BASE_URL = getattr(
    settings,
    "EXTERNAL_TICKET_API_URL",
    os.getenv("EXTERNAL_TICKET_API_URL", "http://165.22.247.50:1001/")
)

# Cache settings
TICKET_CACHE_TTL = 300
TICKET_WARNING_TTL = 60
LIST_CACHE_TTL = 300
LIST_WARNING_TTL = 60


def _build_url(path):
    return f"{BASE_URL.rstrip('/')}/{path.lstrip('/')}"


def _fetch_ticket_by_id_from_endpoint(endpoint, ticket_id):
    """Helper to fetch a ticket by ID from a specific endpoint."""
    url = _build_url(endpoint)
    try:
        resp = client_get(url, params={"id": ticket_id}, timeout=6)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()
        # Handle 'value' key (new format) or list directly
        tickets = data.get('value') if isinstance(data, dict) else data
        if isinstance(tickets, list):
            for ticket in tickets:
                if ticket.get("id") == ticket_id:
                    return ticket
            return None
        return data
    except RequestException:
        return None


def get_ticket_by_id(ticket_id):
    """Fetch a ticket by ID from the external ticket service with caching.
    """
    if not ticket_id:
        return None

    key = f"external:ticket:{ticket_id}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    # Use the new /external/ams/tickets/ endpoint
    result = _fetch_ticket_by_id_from_endpoint("external/ams/tickets/", ticket_id)

    if result:
        cache.set(key, result, TICKET_CACHE_TTL)
    else:
        result = {"warning": f"Ticket {ticket_id} not found."}
        cache.set(key, result, TICKET_WARNING_TTL)

    return result


def get_ticket_by_asset_id(asset_id, status=None):
    """Fetch the first ticket for a specific asset with caching.

    Args:
        asset_id: The ID of the asset
        status: Optional filter - 'resolved' or 'unresolved'
    """
    if not asset_id:
        return None

    key = f"external:tickets:asset:{asset_id}:{status or 'all'}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    # Use the new /external/ams/tickets/ endpoint
    endpoint = "external/ams/tickets/"
    url = _build_url(endpoint)
    try:
        resp = client_get(url, params={"asset": asset_id}, timeout=6)
        if resp.status_code == 404:
            cache.set(key, None, TICKET_WARNING_TTL)
            return None
        resp.raise_for_status()
        data = resp.json()

        # Handle 'value' key (new format) or list directly
        tickets = data.get('value') if isinstance(data, dict) else data

        # Find ticket for this asset, optionally filtering by status
        ticket = None
        if isinstance(tickets, list):
            for t in tickets:
                if t.get("asset") == asset_id:
                    # Filter by is_resolved if status specified
                    if status == 'resolved' and not t.get('is_resolved', False):
                        continue
                    if status == 'unresolved' and t.get('is_resolved', False):
                        continue
                    ticket = t
                    break

        if ticket:
            cache.set(key, ticket, TICKET_CACHE_TTL)
        else:
            cache.set(key, None, TICKET_WARNING_TTL)

        return ticket
    except RequestException:
        cache.set(key, None, TICKET_WARNING_TTL)
        return None


def get_unresolved_ticket_by_asset_id(asset_id):
    """Fetch the unresolved ticket for a specific asset."""
    return get_ticket_by_asset_id(asset_id, status='unresolved')


def fetch_resource_list(resource_name, params=None, skip_api_prefix=False):
    """Fetch a list endpoint from the external ticket service."""
    params = params or {}
    url = _build_url(resource_name + '/')

    try:
        resp = client_get(url, params=params, timeout=8)
        if resp.status_code == 404:
            return {"warning": "Resource not found."}
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and 'results' in data:
            return data
        return data
    except RequestException:
        return {"warning": "External ticket service unreachable."}


def resolve_ticket(ticket_id, asset_checkout_id=None, asset_checkin_id=None):
    """Resolve a ticket by POSTing to /external/resolve/ with ticket_number.

    Args:
        ticket_id: The ID of the ticket to resolve
        asset_checkout_id: The ID of the AssetCheckout record (unused by external API)
        asset_checkin_id: The ID of the AssetCheckin record (unused by external API)
    """
    if not ticket_id:
        return None

    # First, fetch the ticket to get its ticket_number
    ticket = get_ticket_by_id(ticket_id)
    if not ticket or ticket.get("warning"):
        return {"warning": f"Cannot resolve: Ticket {ticket_id} not found."}

    ticket_number = ticket.get("ticket_number")
    if not ticket_number:
        return {"warning": f"Cannot resolve: Ticket {ticket_id} has no ticket_number."}

    # POST to external resolve endpoint
    url = _build_url("external/resolve/")
    payload = {"ticket_number": ticket_number}

    try:
        resp = client_post(url, json=payload, timeout=6)
        resp.raise_for_status()
        # Invalidate ticket cache
        cache.delete(f"external:ticket:{ticket_id}")
        return resp.json() if resp.content else {"success": True}
    except RequestException as e:
        return {"warning": f"Failed to resolve ticket: {str(e)}"}


def get_tickets_list(ticket_type='unresolved', q=None, limit=50):
    """Fetch a list of tickets from the external ticket service.

    Args:
        ticket_type: 'unresolved' or 'resolved'
        q: Optional search query
        limit: Max results
    """
    key = f"external:list:tickets:{ticket_type}:{q}:{limit}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    # The external API uses /external/ams/tickets/ endpoint
    # It returns all tickets with is_resolved field, filter client-side
    endpoint = "external/ams/tickets"
    params = {}
    if q:
        params['q'] = q
    if limit:
        params['limit'] = limit

    result = fetch_resource_list(endpoint, params=params)

    # Filter by is_resolved based on ticket_type
    if isinstance(result, dict) and not result.get('warning'):
        # Handle both 'value' key (new format) and 'results' key (old format)
        tickets = result.get('value') or result.get('results') or []
        if ticket_type == 'unresolved':
            filtered = [t for t in tickets if not t.get('is_resolved', False)]
        else:
            filtered = [t for t in tickets if t.get('is_resolved', False)]
        result = {'results': filtered, 'count': len(filtered)}

    if isinstance(result, dict) and result.get('warning'):
        cache.set(key, result, LIST_WARNING_TTL)
    else:
        cache.set(key, result, LIST_CACHE_TTL)
    return result


def get_unresolved_tickets_list(q=None, limit=50):
    """Fetch unresolved tickets (for checkout)."""
    return get_tickets_list(ticket_type='unresolved', q=q, limit=limit)


def get_resolved_tickets_list(q=None, limit=50):
    """Fetch resolved tickets (for checkin)."""
    return get_tickets_list(ticket_type='resolved', q=q, limit=limit)

