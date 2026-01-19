from typing import List, Dict, Optional
from datetime import date, timedelta
from ..models import Asset
from .contexts import get_statuses_list
from ..models import AssetCheckout


def _build_lookup_dict(data) -> Dict[int, Dict]:
    if isinstance(data, dict) and 'results' in data:
        items = data['results']
    elif isinstance(data, list):
        items = data
    else:
        return {}
    return {item.get('id'): item for item in items if item.get('id')}


def generate_upcoming_eol_report(today: Optional[date] = None, window_days: int = 30) -> List[Dict]:
    """Return a compact list of assets for Upcoming End-of-Life display.

    Each row contains: image, id (assetId), product, statusName, assetName,
    serialNumber, warranty (ISO date or empty), endOfLife (ISO date or empty).
    """
    today = today or date.today()

    end_date = today + timedelta(days=window_days)

    # Only include assets whose product has an end_of_life date within the upcoming window
    qs = Asset.objects.select_related('product').filter(
        is_deleted=False,
        product__is_deleted=False,
        product__end_of_life__gt=today,
        product__end_of_life__lte=end_date,
    )

    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))

    # Get active checkouts so we can surface who an asset is checked out to
    active_checkouts = {}
    try:
        checkout_qs = AssetCheckout.objects.filter(asset_checkin__isnull=True).select_related('asset')
        for checkout in checkout_qs:
            if checkout.asset_id:
                active_checkouts[checkout.asset_id] = {
                    'checkout_to': checkout.checkout_to or '',
                    'checkout_date': checkout.checkout_date.isoformat() if checkout.checkout_date else '',
                }
    except Exception:
        active_checkouts = {}

    results: List[Dict] = []

    for asset in qs.order_by('asset_id'):
        product = getattr(asset, 'product', None)

        # status
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_name = status_info.get('name', '') if status_info else ''
        status_type = status_info.get('type', '') if status_info else ''

        # image: prefer asset image, else product image
        img_url = ''
        try:
            if getattr(asset, 'image', None):
                img_url = asset.image.url if getattr(asset.image, 'url', None) else ''
            elif product and getattr(product, 'image', None):
                img_url = product.image.url if getattr(product.image, 'url', None) else ''
        except Exception:
            img_url = ''

        warranty_iso = asset.warranty_expiration.isoformat() if getattr(asset, 'warranty_expiration', None) else ''
        end_of_life_iso = product.end_of_life.isoformat() if product and getattr(product, 'end_of_life', None) else ''

        checkout_info = active_checkouts.get(asset.id, {})
        checked_out_to = str(checkout_info.get('checkout_to', '')) if checkout_info.get('checkout_to') else ''

        results.append({
            'image': img_url,
            'id': asset.id,
            'assetId': asset.asset_id or str(asset.id),
            'product': product.name if product else '',
            'status': status_name,
            'statusType': status_type,
            'checkedOutTo': checked_out_to,
            'assetName': asset.name or '',
            'serialNumber': asset.serial_number or '',
            'warranty': warranty_iso,
            'endOfLife': end_of_life_iso,
        })

    return results


def print_sample(limit: int = 10):
    rows = generate_upcoming_eol_report()
    for r in rows[:limit]:
        print(r)
