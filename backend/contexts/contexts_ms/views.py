from rest_framework import viewsets
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from contexts_ms.services.usage_check import is_item_in_use
from rest_framework import serializers as drf_serializers
from contexts_ms.services.assets import *
import requests
from django.db import transaction

# Bulk delete safety limits
MAX_BULK_DELETE = 500
CHUNK_SIZE = 50

# Map context item type to model class for bulk operations
MODEL_BY_TYPE = {
    'category': Category,
    'supplier': Supplier,
    'depreciation': Depreciation,
    'manufacturer': Manufacturer,
    'status': Status,
    'location': Location,
}


def _build_cant_delete_message(instance, usage):
    """Build user-facing deletion-blocking message per your spec.

    Rules:
    - If assets reference the context, show Asset(s) and include up to 3 sample asset identifiers.
    - If no assets but components and/or repairs reference it, list component(s) and/or repair(s).
    - Message format:
      "This context (supplier) can't be deleted. Currently used by Asset(s): AST-..."
      or
      "This context (category) can't be deleted. Currently used by component(s) and repair(s)."
    """
    # context label: use lowercase model name
    label = instance.__class__.__name__.lower()
    asset_ids = usage.get('asset_ids') or []
    comp_ids = usage.get('component_ids') or []
    repair_ids = usage.get('repair_ids') or []

    # Try to present a human-friendly name for the context when available.
    display = None
    for attr in ('name', 'city', 'title'):
        val = getattr(instance, attr, None)
        if val:
            display = str(val)
            break

    def label_with_display():
        # Present a human-friendly label without numeric ids.
        if display:
            return f"{label} '{display}'"
        return label

    if asset_ids:
        # If there are few assets, show their identifiers. If many (>5), avoid long messages
        # and present a generic statement to keep the error concise.
        total = len(asset_ids)
        if total <= 5:
            samples = ', '.join(map(str, asset_ids))
            return f"Cannot delete {label_with_display()}. Currently used by Asset(s): {samples}."
        else:
            return f"Cannot delete {label_with_display()}. Currently used by assets."

    parts = []
    if comp_ids:
        parts.append('component(s)')
    if repair_ids:
        parts.append('repair(s)')

    if parts:
        if len(parts) == 1:
            body = parts[0]
        elif len(parts) == 2:
            body = f"{parts[0]} and {parts[1]}"
        else:
            body = ', '.join(parts[:-1]) + f", and {parts[-1]}"
        return f"Cannot delete {label_with_display()}. Currently used by {body}."

    # fallback generic message
    return f"Cannot delete {label_with_display()}. It is referenced by other records."


def _bulk_delete_handler(request, item_type, hard_delete=False):
    """Handle bulk delete for a given context item type.

    Request body: { "ids": [1,2,3,...] }

    Response: {
      "deleted": [ids],
      "skipped": { id: "reason" }
    }
    """
    ids = request.data.get('ids')
    if not isinstance(ids, list):
        return Response({"detail": "Request body must include 'ids' as a list."}, status=status.HTTP_400_BAD_REQUEST)

    # sanitize and dedupe
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

    # process in chunks to limit per-request work and allow partial progress
    for i in range(0, len(ids), CHUNK_SIZE):
        chunk = ids[i:i+CHUNK_SIZE]

        # load instances for this chunk
        instances = {obj.pk: obj for obj in Model.objects.filter(pk__in=chunk)}

        # check usage for each id in chunk
        for pk in chunk:
            inst = instances.get(pk)
            if not inst:
                skipped[pk] = "Not found"
                continue

            try:
                usage = is_item_in_use(item_type, pk)
            except Exception as exc:
                # be conservative: skip deletion if we can't determine usage
                skipped[pk] = "Could not verify usage (service error)"
                continue

            if usage.get('in_use'):
                # build a helpful reason message
                msg = _build_cant_delete_message(inst, usage)
                skipped[pk] = msg
                continue

            # safe to delete
            deleted.append(pk)

    # perform actual deletes/soft-deletes in DB
    if deleted:
        if hard_delete:
            # hard deletes: delete in chunks to avoid long transactions
            for i in range(0, len(deleted), CHUNK_SIZE):
                chunk = deleted[i:i+CHUNK_SIZE]
                try:
                    with transaction.atomic():
                        Model.objects.filter(pk__in=chunk).delete()
                except Exception as exc:
                    # if a DB error occurs, move those ids to skipped with reason
                    for pk in chunk:
                        if pk in deleted:
                            deleted.remove(pk)
                            skipped[pk] = f"Delete failed: {str(exc)}"
        else:
            # soft delete (set is_deleted=True) with bulk update
            try:
                with transaction.atomic():
                    Model.objects.filter(pk__in=deleted).update(is_deleted=True)
            except Exception as exc:
                # fallback: try deleting one by one
                for pk in list(deleted):
                    try:
                        obj = Model.objects.get(pk=pk)
                        obj.is_deleted = True
                        obj.save()
                    except Exception as exc2:
                        deleted.remove(pk)
                        skipped[pk] = f"Soft-delete failed: {str(exc2)}"

    return Response({"deleted": deleted, "skipped": skipped}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_all_location(request):
    locations = Location.objects.all()
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)

#CATEGORY
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("category", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'category', hard_delete=False)
#END

#SUPPLIER 
class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Supplier.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        # Check if supplier is still used in assets-service
        usage = is_item_in_use("supplier", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'supplier', hard_delete=False)
#END

#DEPRECIATION
class DepreciationViewSet(viewsets.ModelViewSet):
    serializer_class = DepreciationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Depreciation.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("depreciation", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'depreciation', hard_delete=False)
#END

#MANUFACTURER
class ManufacturerViewSet(viewsets.ModelViewSet):
    serializer_class = ManufacturerSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Manufacturer.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("manufacturer", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'manufacturer', hard_delete=False)

# STATUS
class StatusViewSet(viewsets.ModelViewSet):
    serializer_class = StatusSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Status.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        # prevent deleting statuses that are in use
        usage = is_item_in_use("status", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'status', hard_delete=False)

# LOCATION
class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Location.objects.all().order_by('city')

    def perform_destroy(self, instance):
        # Location has no is_deleted flag; perform hard delete only if not referenced.
        usage = is_item_in_use("location", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.delete()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        return _bulk_delete_handler(request, 'location', hard_delete=True)

# Get all manufacturer's names
@api_view(['GET'])
def get_manaufacturers_names(request):
    manufacturers = Manufacturer.objects.filter(is_deleted=False)
    serializedManufacturer = ManufacturerNameSerializer(manufacturers, many=True).data

    data = {
        'manufacturers': serializedManufacturer,
    }
    return Response(data)

# Get context names
@api_view(['GET'])
def get_contexts_names(request):
    manufacturers = Manufacturer.objects.filter(is_deleted=False)
    serializedManufacturer = ManufacturerNameSerializer(manufacturers, many=True).data
    data = {
        'manufacturers': serializedManufacturer,
    }
    return Response(data)

#Get manufacturer name by id
@api_view(['GET'])
def get_manu_name_by_id(request, id):
    try:
        manufacturer = Manufacturer.objects.get(pk=id, is_deleted=False)
    except Manufacturer.DoesNotExist:
        return Response({'detail': 'Manufacturer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializedData = ManufacturerNameSerializer(manufacturer)

    data = {
        'manufacturer': serializedData.data,
    }

    return Response(data)

#END

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketResolveSerializer

    # GET /tickets/resolved/
    @action(detail=False, methods=['get'])
    def resolved(self, request):
        tickets = self.queryset.filter(is_resolved=True)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    # GET /tickets/unresolved/
    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        tickets = self.queryset.filter(is_resolved=False)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

class RecycleBinViewSet(viewsets.ViewSet):
    """Handles viewing and recovering deleted items from the Assets service"""

    def list(self, request):
        """List all deleted assets and components"""
        assets = get_deleted_assets()
        components = get_deleted_components()
        return Response({
            "deleted_assets": assets,
            "deleted_components": components
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def recover_asset(self, request, pk=None):
        """Recover asset"""
        try:
            data = recover_asset(pk)
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as exc:
            # If the upstream response is present, forward its status and content
            resp = getattr(exc, 'response', None)
            if resp is not None:
                try:
                    return Response(resp.json(), status=resp.status_code)
                except Exception:
                    return Response({'detail': resp.text}, status=resp.status_code)
            # Unknown HTTP error
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=True, methods=['patch'])
    def recover_component(self, request, pk=None):
        """Recover component"""
        try:
            data = recover_component(pk)
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.HTTPError as exc:
            resp = getattr(exc, 'response', None)
            if resp is not None:
                try:
                    return Response(resp.json(), status=resp.status_code)
                except Exception:
                    return Response({'detail': resp.text}, status=resp.status_code)
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

