from typing import List, Dict, Optional
from datetime import date
from ..models import Asset, Product, AssetCheckout
from .contexts import get_statuses_list


def _build_lookup_dict(data) -> Dict[int, Dict]:
    """Build {id: item} lookup from a paginated or plain list response."""
    if isinstance(data, dict) and 'results' in data:
        items = data['results']
    elif isinstance(data, list):
        items = data
    else:
        return {}
    return {item.get('id'): item for item in items if item.get('id')}


def generate_reached_eol_report(today: Optional[date] = None) -> List[Dict]:
    """Return a compact list of assets whose product has reached end-of-life.

    The "reached end of life" dashboard metric counts Products with
    end_of_life <= today and is_deleted = False. To keep the numbers
    aligned, this report only includes assets whose related product
    satisfies the same condition.

    Each row roughly mirrors the Upcoming EoL report shape used by
    the frontend:
        - image (URL, may be empty)
        - id (asset PK)
        - assetId (human-facing asset_id string)
        - product (product name)
        - status (status display name)
        - statusType (status type code: deployable/deployed/etc.)
        - checkedOutTo (string; who it's checked out to, if any)
        - assetName (asset name/label)
        - serialNumber (asset.serial_number)
        - warranty (ISO warranty_expiration date or '')
        - endOfLife (ISO product.end_of_life date or '')
    """

    today = today or date.today()

    # Restrict to assets whose product has already reached end-of-life
    qs = Asset.objects.select_related('product').filter(
        is_deleted=False,
        product__is_deleted=False,
        product__end_of_life__lte=today,
    )

    # Status lookup (mirrors upcoming_eol_report)
    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))

    # Active checkouts per asset (for checkedOutTo display)
    active_checkouts: Dict[int, Dict] = {}
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

        # Status info
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_name = status_info.get('name', '') if status_info else ''
        status_type = status_info.get('type', '') if status_info else ''

        # Image: prefer per-asset image, else product image
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


def print_sample(limit: int = 10) -> None:
    rows = generate_reached_eol_report()
    for r in rows[:limit]:
        print(r)
