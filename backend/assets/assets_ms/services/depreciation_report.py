from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional
from ..models import Asset, AssetCheckout
from .contexts import get_depreciation_by_id, get_status_by_id

#Will Add authentication imports here later
#Fix the information about tickets later

def _months_between(start_date: Optional[date], end_date: date) -> int:
    """Return whole months elapsed between two dates (end_date >= start_date).
    If start_date is None or in the future, returns 0.
    """
    if not start_date:
        return 0
    # Use year/month difference and adjust by day
    y1, m1, d1 = start_date.year, start_date.month, start_date.day
    y2, m2, d2 = end_date.year, end_date.month, end_date.day
    months = (y2 - y1) * 12 + (m2 - m1)
    if d2 < d1:
        months -= 1
    return max(months, 0)


def generate_depreciation_report(today: Optional[date] = None, depreciation_id: Optional[int] = None) -> List[Dict]:
    """Return a list of assets that have a depreciation configured and computed metrics.

    Each list item contains keys used by the frontend report mockup, for example:
    - assetId, product, statusType, statusName, deployedTo, depreciationName,
      duration, currency, minimumValue, purchaseCost, currentValue,
      depreciated, monthlyDepreciation, monthsLeft

    Parameters:
    - today: optional date to use as "now" for calculations (defaults to today)
    - depreciation_id: if provided, filter assets to that depreciation id
    """
    today = today or date.today()

    qs = Asset.objects.select_related('product').filter(
        is_deleted=False,
        product__is_deleted=False,
    ).exclude(product__depreciation__isnull=True)

    if depreciation_id is not None:
        qs = qs.filter(product__depreciation=depreciation_id)

    results = []

    for asset in qs.order_by('asset_id'):
        product = getattr(asset, 'product', None)

        # Resolve depreciation (may be dict or object returned by contexts)
        dep = None
        if product and getattr(product, 'depreciation', None):
            dep = get_depreciation_by_id(product.depreciation)

        # Fallbacks for depreciation fields
        dep_name = None
        duration = None
        minimum_value = None
        currency = None

        if isinstance(dep, dict):
            dep_name = dep.get('name') or dep.get('display_name') or dep.get('title')
            duration = dep.get('duration') if 'duration' in dep else dep.get('months') if 'months' in dep else dep.get('duration_months')
            minimum_value = dep.get('minimum_value') if 'minimum_value' in dep else dep.get('minimumValue') if 'minimumValue' in dep else dep.get('minimum') if 'minimum' in dep else None
            currency = dep.get('currency') or dep.get('symbol')
        elif dep is not None:
            # support object-like depreciation
            dep_name = getattr(dep, 'name', None) or getattr(dep, 'display_name', None) or getattr(dep, 'title', None)
            duration = getattr(dep, 'duration', None) or getattr(dep, 'months', None) or getattr(dep, 'duration_months', None)
            minimum_value = getattr(dep, 'minimum_value', None) if getattr(dep, 'minimum_value', None) is not None else getattr(dep, 'minimumValue', None) if getattr(dep, 'minimumValue', None) is not None else getattr(dep, 'minimum', None)
            currency = getattr(dep, 'currency', None) or getattr(dep, 'symbol', None)

        # Purchase cost resolution
        try:
            raw_purchase = asset.purchase_cost if asset.purchase_cost is not None else (product.default_purchase_cost if product and getattr(product, 'default_purchase_cost', None) is not None else 0)
            purchase_cost = Decimal(str(raw_purchase))
        except Exception:
            purchase_cost = Decimal('0.00')

        # Duration and minimum value, explicit None checks so 0 is preserved when intended
        duration = int(duration) if duration is not None else 36
        if duration <= 0:
            duration = 0

        minimum_value = Decimal(str(minimum_value)) if minimum_value is not None else Decimal('0.00')
        currency = currency or "₱"

        # Calculate months elapsed and depreciation amounts using Decimal for currency precision
        months_elapsed = _months_between(getattr(asset, 'purchase_date', None), today)
        depreciable_amount = max(Decimal('0.00'), purchase_cost - minimum_value)

        if depreciable_amount <= Decimal('0.00') or duration <= 0:
            monthly_dep = Decimal('0.00')
        else:
            monthly_dep = (depreciable_amount / Decimal(duration)).quantize(Decimal('0.0001'))

        depreciated = min(Decimal(months_elapsed) * monthly_dep, depreciable_amount)
        current_value = max(minimum_value, purchase_cost - depreciated)
        months_left = max(duration - months_elapsed, 0)

        # Status lookups (contexts) - support dict or object
        status_info = get_status_by_id(asset.status) if getattr(asset, 'status', None) else None
        status_type = ''
        status_name = ''
        if isinstance(status_info, dict):
            status_type = status_info.get('code') or status_info.get('slug') or ''
            status_name = status_info.get('name') or status_info.get('display_name') or ''
        elif status_info is not None:
            status_type = getattr(status_info, 'code', None) or getattr(status_info, 'slug', None) or ''
            status_name = getattr(status_info, 'name', None) or getattr(status_info, 'display_name', None) or ''

        # Try to determine who the asset is deployed to using AssetCheckout if model supports it
        deployed_to = None
        try:
            # common field names used in checkout models: is_returned, returned, active, person, deployed_to
            checkout_qs = AssetCheckout.objects.filter(asset=asset)
            # prefer active/unchecked-out entries
            for flag in ('is_returned', 'returned', 'active'):
                if hasattr(AssetCheckout, flag):
                    checkout_qs = checkout_qs.filter(**{flag: False})
                    break
            last_checkout = checkout_qs.order_by('-id').first()
            if last_checkout is not None:
                deployed_to = getattr(last_checkout, 'person_name', None) or getattr(last_checkout, 'deployed_to', None) or (getattr(last_checkout, 'person', None).get_full_name() if getattr(last_checkout, 'person', None) and hasattr(getattr(last_checkout, 'person', None), 'get_full_name') else None)
        except Exception:
            deployed_to = None

        # Quantize/format currency values to 2 decimals for stable float output to frontend
        def to_float(d: Decimal) -> float:
            return float(d.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))

        results.append({
            'id': asset.id,
            'assetId': asset.asset_id or asset.id,
            'product': product.name if product else '',
            'statusType': status_type,
            'statusName': status_name,
            'deployedTo': deployed_to,
            'depreciationName': dep_name or '',
            'duration': duration,
            'currency': currency,
            'minimumValue': to_float(minimum_value),
            'purchaseCost': to_float(purchase_cost),
            'currentValue': to_float(current_value),
            'depreciated': to_float(depreciated),
            'monthlyDepreciation': to_float(monthly_dep),
            'monthsLeft': months_left,
        })

    return results


def print_sample_report(limit: int = 10) -> None:
    """Utility to print a short sample to stdout (safe to run from manage.py shell).
    Note: Running this as a standalone script requires Django settings to be configured.
    """
    rows = generate_depreciation_report()
    for r in rows[:limit]:
        print(r)
