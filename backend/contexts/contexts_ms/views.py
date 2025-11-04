from rest_framework import viewsets
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from contexts_ms.services.usage_check import is_item_in_use
from rest_framework import serializers as drf_serializers
from contexts_ms.services.assets import *
import requests


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


@api_view(['GET'])
def get_all_location(request):
    locations = Location.objects.all()
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)

#CATEGORY
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("category", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()
#END

#SUPPLIER 
class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    parser_classes = [MultiPartParser, FormParser]

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
#END

#DEPRECIATION
class DepreciationViewSet(viewsets.ModelViewSet):
    serializer_class = DepreciationSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Depreciation.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("depreciation", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()
#END

#MANUFACTURER
class ManufacturerViewSet(viewsets.ModelViewSet):
    serializer_class = ManufacturerSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Manufacturer.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        usage = is_item_in_use("manufacturer", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.is_deleted = True
        instance.save()

# STATUS
class StatusViewSet(viewsets.ModelViewSet):
    serializer_class = StatusSerializer
    parser_classes = [MultiPartParser, FormParser]

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

# LOCATION
class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Location.objects.all().order_by('city')

    def perform_destroy(self, instance):
        # Location has no is_deleted flag; perform hard delete only if not referenced.
        usage = is_item_in_use("location", instance.id)
        if usage.get('in_use'):
            msg = _build_cant_delete_message(instance, usage)
            raise drf_serializers.ValidationError({"error": msg})
        instance.delete()

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

