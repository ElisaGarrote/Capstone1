from typing import List, Dict, Optional
from datetime import date
from ..models import Asset, AssetCheckout
from .contexts import get_statuses_list
from .integration_help_desk import get_locations_list


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

    # Batch lookups
    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))
    locations_lookup = _build_lookup_dict(get_locations_list(limit=500))

    # Active checkouts map: asset_id -> last active checkout
    active_checkouts = {}
    checkout_qs = AssetCheckout.objects.select_related('asset')
    for co in checkout_qs:
        # heuristics: prefer checkouts without a returned flag (models may vary)
        active_checkouts.setdefault(co.asset_id, []).append(co)

    results = []

    for asset in qs.order_by('asset_id'):
        product = getattr(asset, 'product', None)

        # status
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_type = status_info.get('type', '') if status_info else ''
        status_name = status_info.get('name', '') if status_info else ''

        # location - resolve robustly (asset.location may be id, string, or dict)
        location_name = _resolve_lookup_name(asset.location, locations_lookup)
        # fallback: if asset has a direct location_name attribute, use it
        if not location_name:
            location_name = getattr(asset, 'location_name', '') or getattr(asset, 'location_display', '') or ''

        # deployedTo: inspect active_checkouts entries and pick most recent
        deployed_to = None
        try:
            lst = active_checkouts.get(asset.id) or []
            if lst:
                # pick latest by id (assumes increasing ids) or checkout_date
                last = sorted(lst, key=lambda x: getattr(x, 'id', 0))[-1]
                deployed_to = getattr(last, 'person_name', None) or getattr(last, 'deployed_to', None) or getattr(last, 'checkout_to', None) or None
        except Exception:
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
