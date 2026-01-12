from typing import List, Dict, Optional
from datetime import date, timedelta

from ..models import Asset, AssetCheckout
from .contexts import get_statuses_list
from .upcoming_eol_report import _build_lookup_dict


def generate_expired_warranty_report(today: Optional[date] = None) -> List[Dict]:
    """Return a compact list of assets with expired warranty.

    Each row contains: image, id (assetId), product, status, statusType,
    checkedOutTo, assetName, serialNumber, warranty (ISO date), endOfLife (ISO date).
    """
    today = today or date.today()

    # Only include assets whose warranty has already expired
    qs = Asset.objects.select_related("product").filter(
        is_deleted=False,
        product__is_deleted=False,
        warranty_expiration__isnull=False,
        warranty_expiration__lte=today,
    )

    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))

    # Get active checkouts so we can surface who an asset is checked out to
    active_checkouts: Dict[int, Dict] = {}
    try:
        checkout_qs = AssetCheckout.objects.filter(asset_checkin__isnull=True).select_related("asset")
        for checkout in checkout_qs:
            if checkout.asset_id:
                active_checkouts[checkout.asset_id] = {
                    "checkout_to": checkout.checkout_to or "",
                    "checkout_date": checkout.checkout_date.isoformat() if checkout.checkout_date else "",
                }
    except Exception:
        active_checkouts = {}

    results: List[Dict] = []

    for asset in qs.order_by("asset_id"):
        product = getattr(asset, "product", None)

        # status
        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_name = status_info.get("name", "") if status_info else ""
        status_type = status_info.get("type", "") if status_info else ""

        # image: prefer asset image, else product image
        img_url = ""
        try:
            if getattr(asset, "image", None):
                img_url = asset.image.url if getattr(asset.image, "url", None) else ""
            elif product and getattr(product, "image", None):
                img_url = product.image.url if getattr(product.image, "url", None) else ""
        except Exception:
            img_url = ""

        warranty_iso = (
            asset.warranty_expiration.isoformat()
            if getattr(asset, "warranty_expiration", None)
            else ""
        )
        end_of_life_iso = (
            product.end_of_life.isoformat()
            if product and getattr(product, "end_of_life", None)
            else ""
        )

        checkout_info = active_checkouts.get(asset.id, {})
        checked_out_to = (
            str(checkout_info.get("checkout_to", ""))
            if checkout_info.get("checkout_to")
            else ""
        )

        results.append(
            {
                "image": img_url,
                "id": asset.id,
                "assetId": asset.asset_id or str(asset.id),
                "product": product.name if product else "",
                "status": status_name,
                "statusType": status_type,
                "checkedOutTo": checked_out_to,
                "assetName": asset.name or "",
                "serialNumber": asset.serial_number or "",
                "warranty": warranty_iso,
                "endOfLife": end_of_life_iso,
            }
        )

    return results


def generate_expiring_warranty_report(today: Optional[date] = None, window_days: int = 30) -> List[Dict]:
    """Return a compact list of assets with warranties expiring soon.

    Logic matches the dashboard metric for ``expiring_warranties``:
    warranty_expiration > today and <= today + 30 days.

    Each row contains: image, id (assetId), product, status, statusType,
    checkedOutTo, assetName, serialNumber, warranty (ISO date), endOfLife (ISO date).
    """
    today = today or date.today()
    end_date = today + timedelta(days=window_days)

    qs = Asset.objects.select_related("product").filter(
        is_deleted=False,
        product__is_deleted=False,
        warranty_expiration__isnull=False,
        warranty_expiration__gt=today,
        warranty_expiration__lte=end_date,
    )

    statuses_lookup = _build_lookup_dict(get_statuses_list(limit=500))

    active_checkouts: Dict[int, Dict] = {}
    try:
        checkout_qs = AssetCheckout.objects.filter(asset_checkin__isnull=True).select_related("asset")
        for checkout in checkout_qs:
            if checkout.asset_id:
                active_checkouts[checkout.asset_id] = {
                    "checkout_to": checkout.checkout_to or "",
                    "checkout_date": checkout.checkout_date.isoformat() if checkout.checkout_date else "",
                }
    except Exception:
        active_checkouts = {}

    results: List[Dict] = []

    for asset in qs.order_by("asset_id"):
        product = getattr(asset, "product", None)

        status_info = statuses_lookup.get(asset.status) if asset.status else None
        status_name = status_info.get("name", "") if status_info else ""
        status_type = status_info.get("type", "") if status_info else ""

        img_url = ""
        try:
            if getattr(asset, "image", None):
                img_url = asset.image.url if getattr(asset.image, "url", None) else ""
            elif product and getattr(product, "image", None):
                img_url = product.image.url if getattr(product.image, "url", None) else ""
        except Exception:
            img_url = ""

        warranty_iso = (
            asset.warranty_expiration.isoformat()
            if getattr(asset, "warranty_expiration", None)
            else ""
        )
        end_of_life_iso = (
            product.end_of_life.isoformat()
            if product and getattr(product, "end_of_life", None)
            else ""
        )

        checkout_info = active_checkouts.get(asset.id, {})
        checked_out_to = (
            str(checkout_info.get("checkout_to", ""))
            if checkout_info.get("checkout_to")
            else ""
        )

        results.append(
            {
                "image": img_url,
                "id": asset.id,
                "assetId": asset.asset_id or str(asset.id),
                "product": product.name if product else "",
                "status": status_name,
                "statusType": status_type,
                "checkedOutTo": checked_out_to,
                "assetName": asset.name or "",
                "serialNumber": asset.serial_number or "",
                "warranty": warranty_iso,
                "endOfLife": end_of_life_iso,
            }
        )

    return results

def print_sample(limit: int = 10) -> None:
    rows = generate_expired_warranty_report()
    for r in rows[:limit]:
        print(r)
