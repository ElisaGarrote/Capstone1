from .http_client import get as client_get, post as client_post, patch as client_patch, ASSETS_API_URL
import logging

logger = logging.getLogger(__name__)


def get_deleted_assets():
    try:
        response = client_get("assets/deleted/", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch deleted assets: {e}")
        raise


def get_deleted_components():
    try:
        response = client_get("components/deleted/", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch deleted components: {e}")
        raise


def recover_asset(asset_id):
    response = client_patch(f"assets/{asset_id}/recover/")
    response.raise_for_status()
    return response.json()

def recover_component(component_id):
    response = client_patch(f"components/{component_id}/recover/")
    response.raise_for_status()
    return response.json()


def count_assets_by_category(category_id, timeout=5):
    """Return number of assets referencing a given category id.

    Uses the assets service list endpoint and prefers paginated 'count' if present.
    Falls back to length of results when necessary.
    """
    try:
        # Ask for a small page to reduce payload; if service supports pagination it will return 'count'
        params = {'category': category_id, 'page_size': 1}
        r = client_get('assets/', params=params, timeout=timeout)
        r.raise_for_status()
        j = r.json()
        if isinstance(j, dict) and 'count' in j:
            return int(j['count'])
        # otherwise attempt to extract results list
        results = j.get('results') if isinstance(j, dict) else j
        if isinstance(results, list):
            return len(results)
        return 0
    except Exception:
        # On error, return None to signal unknown count
        return None


def count_components_by_category(category_id, timeout=5):
    """Return number of components referencing a given category id."""
    try:
        params = {'category': category_id, 'page_size': 1}
        r = client_get('components/', params=params, timeout=timeout)
        r.raise_for_status()
        j = r.json()
        if isinstance(j, dict) and 'count' in j:
            return int(j['count'])
        results = j.get('results') if isinstance(j, dict) else j
        if isinstance(results, list):
            return len(results)
        return 0
    except Exception:
        return None


def bulk_check_usage(item_type, ids, sample_limit=0, timeout=8):
    """Call the assets service bulk usage endpoint for multiple ids.

    Returns a dict mapping id -> usage dict as returned by assets service.
    On any request error returns an empty dict.
    """
    try:
        if not isinstance(ids, (list, tuple)):
            ids = list(ids)
        payload = {
            'type': item_type,
            'ids': ids,
            'options': {'sample_limit': sample_limit}
        }
        r = client_post('usage/check_bulk/', json=payload, timeout=timeout)
        r.raise_for_status()
        j = r.json() or {}
        results = j.get('results') if isinstance(j, dict) else None
        out = {}
        if isinstance(results, list):
            for entry in results:
                try:
                    key = int(entry.get('id'))
                except Exception:
                    continue
                out[key] = entry
        return out
    except Exception:
        return {}

def get_asset_by_id(asset_id):
    response = client_get(f"assets/{asset_id}/")
    response.raise_for_status()
    return response.json()

def get_asset_checkout_by_id(checkout_id):
    response = client_get(f"asset-checkout/{checkout_id}/")
    response.raise_for_status()
    return response.json()

def invalidate_asset_cache(asset_id):
    """
    Call the Assets service to invalidate cache for a specific asset.
    Used when tickets are created/updated/deleted to ensure fresh data.
    """
    try:
        response = client_post(f"assets/{asset_id}/invalidate-cache/")
        response.raise_for_status()
        return response.json()
    except Exception:
        # Silently fail - cache invalidation is best-effort
        return None


def get_assets_by_category(category_id, timeout=8):
    """
    Fetch assets by category ID using the /assets/hd/registration/?category={id} endpoint.
    Returns a list of asset objects with full HD registration details or empty list on error.
    Only returns assets with deployable or pending status types.
    """
    try:
        response = client_get(
            "assets/hd/registration/",
            params={"category": category_id, "status_type": "deployable,pending"},
            timeout=timeout
        )
        response.raise_for_status()
        data = response.json()
        # Handle both list and paginated responses
        if isinstance(data, dict) and 'results' in data:
            return data['results']
        return data if isinstance(data, list) else []
    except Exception as e:
        logger.error(f"Failed to fetch assets for category {category_id}: {e}")
        return []


def update_category_quantity(category_id):
    """
    Recalculate and update the quantity field for a given category.
    """
    from ..models import Category

    try:
        # Fetch the number of assets linked to the category
        assets = get_assets_by_category(category_id)
        quantity = len(assets)

        # Update the category's quantity field
        Category.objects.filter(id=category_id).update(quantity=quantity)
        logger.info(f"Updated quantity for category {category_id} to {quantity}")
    except Exception as e:
        logger.error(f"Failed to update quantity for category {category_id}: {e}")