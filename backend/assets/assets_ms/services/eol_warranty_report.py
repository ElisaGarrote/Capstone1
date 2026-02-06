from typing import List, Dict, Optional
from datetime import date
from ..models import Asset, AssetCheckout
from .contexts import get_statuses_list
from .integration_help_desk import get_locations_list
from .due_checkin_report import fetch_employees_batch, fetch_locations_batch
import logging

logger = logging.getLogger(__name__)


def _build_lookup_dict(data) -> Dict[int, Dict]:
    if isinstance(data, dict) and 'results' in data:
        items = data['results']
    elif isinstance(data, list):
        items = data
    else:
        return {}
    return {item.get('id'): item for item in items if item.get('id')}


def _resolve_lookup_name(value, lookup) -> str:
    """Resolve a human-readable name from a lookup dict for a given value.

    Handles values that may be: int id, numeric string id, dict with `id` or `name`,
    or a plain name string. Returns empty string when not resolvable.
    """
    if not value:
        return ""

    def _item_label(item):
        return item.get('name') or item.get('city') or item.get('display') or item.get('label') or ''

    # If value is a dict-like (from some contexts responses)
    if isinstance(value, dict):
        vid = value.get('id') or value.get('pk')
        if vid and vid in lookup:
            return _item_label(lookup[vid])
        # fallback to name contained in the dict
        name = value.get('name') or value.get('display') or ''
        if name:
            # try to find matching name in lookup values (case-insensitive)
            for item in lookup.values():
                if _item_label(item).lower() == name.lower():
                    return _item_label(item) or name
            return name

    # Direct key lookup (could be int or str key depending on source)
    if value in lookup:
        return _item_label(lookup[value])

    # If value is numeric string, try int key
    try:
        ival = int(value)
        if ival in lookup:
            return _item_label(lookup[ival])
    except Exception:
        pass

    # Try stringified key
    sval = str(value)
    if sval in lookup:
        return _item_label(lookup[sval])

    # Last resort: search by name in lookup values
    for item in lookup.values():
        if _item_label(item).lower() == sval.lower():
            return _item_label(item)

    return ""


def generate_eol_warranty_report(today: Optional[date] = None) -> List[Dict]:
    """Return a list of assets with end-of-life and warranty fields for reporting.

    Each row contains:
      - id, assetId, product, statusType, statusName, deployedTo, location,
        endOfLifeDate, warrantyExpiration
    """
    today = today or date.today()

    qs = Asset.objects.select_related('product').filter(
        is_deleted=False,
        product__is_deleted=False,
    )

    # Batch lookups for statuses
    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))

    # Active checkouts map: asset_id -> last active checkout (only those without checkin)
    active_checkouts = {}
    checkout_qs = AssetCheckout.objects.select_related('asset').filter(
        asset_checkin__isnull=True  # Only active checkouts (not checked in)
    )
    
    for co in checkout_qs:
        active_checkouts.setdefault(co.asset_id, []).append(co)

    # Collect all unique employee IDs and location IDs for batch fetching
    employee_ids = set()
    location_ids = set()
    
    # Get all assets as a list to iterate twice (once for collecting IDs, once for building results)
    assets_list = list(qs.order_by('asset_id'))
    
    for asset in assets_list:
        # Collect location IDs
        if asset.location:
            # Handle both int and string location IDs
            try:
                if isinstance(asset.location, (int, str)):
                    loc_id = int(asset.location) if isinstance(asset.location, str) else asset.location
                    location_ids.add(loc_id)
            except (ValueError, TypeError):
                pass
        
        # Collect employee IDs from active checkouts
        checkouts = active_checkouts.get(asset.id) or []
        for co in checkouts:
            if co.checkout_to:
                try:
                    emp_id = int(co.checkout_to) if isinstance(co.checkout_to, str) else co.checkout_to
                    employee_ids.add(emp_id)
                except (ValueError, TypeError):
                    pass
    
    # Batch fetch employees and locations concurrently
    logger.info(f"EOL Report: Fetching {len(employee_ids)} employees and {len(location_ids)} locations in batch...")
    employee_map = fetch_employees_batch(list(employee_ids))
    location_map = fetch_locations_batch(list(location_ids))
    logger.info(f"EOL Report: Batch fetch complete. Got {len(employee_map)} employees and {len(location_map)} locations.")

    results = []

    for asset in assets_list:
        product = getattr(asset, 'product', None)

        # status
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_type = status_info.get('type', '') if status_info else ''
        status_name = status_info.get('name', '') if status_info else ''

        # location - use batch-fetched location data
        location_name = ''
        if asset.location:
            try:
                loc_id = int(asset.location) if isinstance(asset.location, str) else asset.location
                if loc_id in location_map:
                    location_data = location_map[loc_id]
                    if isinstance(location_data, dict):
                        location_name = (
                            location_data.get('name') or 
                            location_data.get('city') or 
                            location_data.get('display_name') or 
                            ''
                        )
            except (ValueError, TypeError):
                pass

        # deployedTo: get from active checkouts and resolve employee name from batch-fetched data
        deployed_to = None
        try:
            checkouts = active_checkouts.get(asset.id) or []
            if checkouts:
                # Pick latest checkout by id
                last_checkout = sorted(checkouts, key=lambda x: getattr(x, 'id', 0))[-1]
                
                # Get employee ID and resolve name from batch-fetched data
                emp_id = last_checkout.checkout_to
                if emp_id:
                    try:
                        emp_id_int = int(emp_id) if isinstance(emp_id, str) else emp_id
                        if emp_id_int in employee_map:
                            emp_data = employee_map[emp_id_int]
                            if isinstance(emp_data, dict):
                                # Handle different response structures
                                if emp_data.get('employee'):
                                    emp = emp_data['employee']
                                    deployed_to = f"{emp.get('first_name', '')} {emp.get('middle_name', '')} {emp.get('last_name', '')} {emp.get('suffix', '')}".strip()
                                elif emp_data.get('first_name') or emp_data.get('last_name'):
                                    deployed_to = f"{emp_data.get('first_name', '')} {emp_data.get('middle_name', '')} {emp_data.get('last_name', '')} {emp_data.get('suffix', '')}".strip()
                                elif emp_data.get('firstName') or emp_data.get('lastName'):
                                    deployed_to = f"{emp_data.get('firstName', '')} {emp_data.get('middleName', '')} {emp_data.get('lastName', '')} {emp_data.get('suffix', '')}".strip()
                    except (ValueError, TypeError):
                        pass
        except Exception as e:
            logger.warning(f"Error resolving deployed_to for asset {asset.id}: {str(e)}")
            deployed_to = None

        # Dates
        end_of_life = product.end_of_life.isoformat() if product and getattr(product, 'end_of_life', None) else ''
        warranty_exp = asset.warranty_expiration.isoformat() if getattr(asset, 'warranty_expiration', None) else ''

        results.append({
            'id': asset.id,
            'assetId': asset.asset_id or str(asset.id),
            'product': product.name if product else '',
            'statusType': status_type,
            'statusName': status_name,
            'deployedTo': deployed_to,
            'location': location_name,
            'endOfLifeDate': end_of_life,
            'warrantyExpiration': warranty_exp,
        })

    return results


def print_sample_report(limit: int = 10) -> None:
    rows = generate_eol_warranty_report()
    for r in rows[:limit]:
        print(r)
