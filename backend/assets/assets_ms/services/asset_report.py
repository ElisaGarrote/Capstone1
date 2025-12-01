from datetime import date
from typing import List, Dict, Optional
from ..models import Asset
from .contexts import (
    get_statuses_list,
    get_categories_list,
    get_suppliers_list,
    get_manufacturers_list,
    get_locations_list,
)


def _build_lookup_dict(data) -> Dict[int, Dict]:
    """Convert a list response into a dict keyed by id for fast lookups."""
    if isinstance(data, dict) and 'results' in data:
        items = data['results']
    elif isinstance(data, list):
        items = data
    else:
        return {}
    return {item.get('id'): item for item in items if item.get('id')}


def generate_asset_report(
    status_id: Optional[int] = None,
    category_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    location_id: Optional[int] = None,
) -> List[Dict]:
    """Return a list of assets with their full details for reporting.

    Uses batch fetching for context data to avoid per-asset HTTP calls.
    """
    qs = Asset.objects.select_related('product').filter(
        is_deleted=False,
        product__is_deleted=False,
    )

    # Apply filters
    if status_id is not None:
        qs = qs.filter(status=status_id)
    if category_id is not None:
        qs = qs.filter(product__category=category_id)
    if supplier_id is not None:
        qs = qs.filter(supplier=supplier_id)
    if location_id is not None:
        qs = qs.filter(location=location_id)

    # Batch fetch all context data upfront (single HTTP call each)
    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))
    categories_lookup = _build_lookup_dict(get_categories_list(limit=500))
    suppliers_lookup = _build_lookup_dict(get_suppliers_list(limit=500))
    manufacturers_lookup = _build_lookup_dict(get_manufacturers_list(limit=500))
    locations_lookup = _build_lookup_dict(get_locations_list(limit=500))

    results = []

    for asset in qs.order_by('asset_id'):
        product = getattr(asset, 'product', None)

        # Status lookup from cache
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_type = status_info.get('type', '') if status_info else ''
        status_name = status_info.get('name', '') if status_info else ''

        # Category lookup
        category_info = None
        category_name = ''
        if product and product.category:
            category_info = categories_lookup.get(product.category)
            category_name = category_info.get('name', '') if category_info else ''

        # Supplier lookup
        supplier_info = suppliers_lookup.get(asset.supplier) if asset.supplier else None
        supplier_name = supplier_info.get('name', '') if supplier_info else ''

        # Manufacturer lookup
        manufacturer_info = None
        manufacturer_name = ''
        if product and product.manufacturer:
            manufacturer_info = manufacturers_lookup.get(product.manufacturer)
            manufacturer_name = manufacturer_info.get('name', '') if manufacturer_info else ''

        # Location lookup
        location_info = locations_lookup.get(asset.location) if asset.location else None
        location_name = location_info.get('name', '') if location_info else ''

        # Format dates
        purchase_date_str = asset.purchase_date.isoformat() if asset.purchase_date else ''
        warranty_exp_str = asset.warranty_expiration.isoformat() if asset.warranty_expiration else ''

        # Purchase cost
        try:
            purchase_cost = float(asset.purchase_cost) if asset.purchase_cost is not None else 0.0
        except (TypeError, ValueError):
            purchase_cost = 0.0

        results.append({
            'id': asset.id,
            'assetId': asset.asset_id or str(asset.id),
            'name': asset.name or '',
            'product': product.name if product else '',
            'category': category_name,
            'statusType': status_type,
            'statusName': status_name,
            'supplier': supplier_name,
            'manufacturer': manufacturer_name,
            'location': location_name,
            'serialNumber': asset.serial_number or '',
            'orderNumber': asset.order_number or '',
            'purchaseDate': purchase_date_str,
            'purchaseCost': purchase_cost,
            'warrantyExpiration': warranty_exp_str,
            'notes': asset.notes or '',
        })

    return results


def print_sample_report(limit: int = 10) -> None:
    """Utility to print a short sample to stdout (for debugging in manage.py shell)."""
    rows = generate_asset_report()
    for r in rows[:limit]:
        print(r)

