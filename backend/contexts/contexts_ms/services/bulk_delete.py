from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .usage_check import is_item_in_use

# Import models from parent package
from ..models import Category, Supplier, Depreciation, Manufacturer, Status, Location

# Bulk delete safety limits
MAX_BULK_DELETE = 500
CHUNK_SIZE = 50

MODEL_BY_TYPE = {
    'category': Category,
    'supplier': Supplier,
    'depreciation': Depreciation,
    'manufacturer': Manufacturer,
    'status': Status,
    'location': Location,
}


def _build_cant_delete_message(instance, usage):
    """Build user-facing deletion-blocking message per spec."""
    label = instance.__class__.__name__.lower()
    asset_ids = usage.get('asset_ids') or []
    comp_ids = usage.get('component_ids') or []
    repair_ids = usage.get('repair_ids') or []
    
    display = None
    for attr in ('name', 'city', 'title'):
        val = getattr(instance, attr, None)
        if val:
            display = str(val)
            break

    def label_with_display():
        if display:
            return f"{label} '{display}'"
        return label

    # If this is a Category, prefer the category's own `type` to determine primary wording
    primary_kind = None
    try:
        kind_attr = getattr(instance, 'type', None)
        if kind_attr in ('asset', 'component'):
            primary_kind = kind_attr
    except Exception:
        primary_kind = None

    # Build simple usage message without showing IDs or counts
    usage_types = []

    # Check what is using this item
    if primary_kind == 'asset' or asset_ids:
        usage_types.append('assets')
    
    if primary_kind == 'component' or (primary_kind is None and comp_ids):
        usage_types.append('components')
    
    if repair_ids:
        usage_types.append('repairs')

    if usage_types:
        usage_str = ' or '.join(usage_types)
        return f"Cannot delete {label_with_display()}. Currently in use by {usage_str}."

    return f"Cannot delete {label_with_display()}. It is referenced by other records."


def _bulk_delete_handler(request, item_type, hard_delete=False):
    """Handle bulk delete for a given context item type.

    Request body: { "ids": [1,2,3,...] }
    Response: {"deleted": [ids], "skipped": { id: "reason" }}
    """
    ids = request.data.get('ids')
    if not isinstance(ids, list):
        return Response({"detail": "Request body must include 'ids' as a list."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ids = [int(x) for x in ids]
    except Exception:
        return Response({"detail": "All ids must be integers."}, status=status.HTTP_400_BAD_REQUEST)

    if len(ids) == 0:
        return Response({"deleted": [], "skipped": {}}, status=status.HTTP_200_OK)

    if len(ids) > MAX_BULK_DELETE:
        return Response({"detail": f"Too many ids: limit is {MAX_BULK_DELETE}."}, status=status.HTTP_400_BAD_REQUEST)

    ids = list(dict.fromkeys(ids))

    Model = MODEL_BY_TYPE.get(item_type)
    if Model is None:
        return Response({"detail": f"Unsupported item type: {item_type}"}, status=status.HTTP_400_BAD_REQUEST)

    deleted = []
    skipped = {}

    for i in range(0, len(ids), CHUNK_SIZE):
        chunk = ids[i:i+CHUNK_SIZE]
        instances = {obj.pk: obj for obj in Model.objects.filter(pk__in=chunk)}

        for pk in chunk:
            inst = instances.get(pk)
            if not inst:
                skipped[pk] = "Not found"
                continue

            try:
                usage = is_item_in_use(item_type, pk)
            except Exception:
                skipped[pk] = "Could not verify usage (service error)"
                continue

            if usage.get('in_use'):
                # Check if this is a network error vs actual usage
                if usage.get('network_error'):
                    msg = f"Cannot verify usage status (service unavailable). Deletion blocked as safety measure."
                else:
                    msg = _build_cant_delete_message(inst, usage)
                skipped[pk] = msg
                continue

            deleted.append(pk)

    if deleted:
        if hard_delete:
            for i in range(0, len(deleted), CHUNK_SIZE):
                chunk = deleted[i:i+CHUNK_SIZE]
                try:
                    with transaction.atomic():
                        Model.objects.filter(pk__in=chunk).delete()
                except Exception as exc:
                    for pk in chunk:
                        if pk in deleted:
                            deleted.remove(pk)
                            skipped[pk] = f"Delete failed: {str(exc)}"
        else:
            try:
                with transaction.atomic():
                    Model.objects.filter(pk__in=deleted).update(is_deleted=True)
            except Exception:
                for pk in list(deleted):
                    try:
                        obj = Model.objects.get(pk=pk)
                        obj.is_deleted = True
                        obj.save()
                    except Exception as exc2:
                        deleted.remove(pk)
                        skipped[pk] = f"Soft-delete failed: {str(exc2)}"

    return Response({"deleted": deleted, "skipped": skipped}, status=status.HTTP_200_OK)
