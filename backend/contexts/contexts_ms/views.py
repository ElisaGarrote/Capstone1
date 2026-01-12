from rest_framework import viewsets, status
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from contexts_ms.services.usage_check import is_item_in_use
from .services.bulk_delete import _bulk_delete_handler, _build_cant_delete_message
from rest_framework import serializers as drf_serializers
from contexts_ms.services.assets import *
import requests
from django.db import transaction


# If will add more views later or functionality, please create file on api folder or services folder
# Only viewsets here
#CATEGORY
class CategoryViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False).order_by('name')
    
    def get_serializer_class(self):
        if self.action == "names":
            return CategoryNameSerializer
        return CategorySerializer

    def list(self, request, *args, **kwargs):
        """Override list to fetch batched usage counts from assets service and pass into serializer context."""
        qs = self.filter_queryset(self.get_queryset())
        ids = list(qs.values_list('id', flat=True))
        usage_map = {}
        if ids:
            try:
                usage_map = bulk_check_usage('category', ids, sample_limit=0)
            except Exception:
                usage_map = {}

        serializer = self.get_serializer(qs, many=True, context={'category_usage': usage_map})
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to include usage for a single category."""
        instance = self.get_object()
        usage_map = {}
        try:
            usage_map = bulk_check_usage('category', [instance.id], sample_limit=0)
        except Exception:
            usage_map = {}
        serializer = self.get_serializer(instance, context={'category_usage': usage_map})
        return Response(serializer.data)

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
    
    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all categories with only name and id.

        Optional query param: ?type=asset or ?type=component
        """
        categories = self.get_queryset()
        category_type = request.query_params.get('type')
        if category_type in ['asset', 'component']:
            categories = categories.filter(type=category_type)

        serializer = CategoryNameSerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='hd/registration')
    def hd_registration(self, request):
        """Return all categories with name, id, and list of assets for HD registration.

        Optional query param: ?type=asset or ?type=component
        """
        categories = self.get_queryset()
        category_type = request.query_params.get('type')
        if category_type in ['asset', 'component']:
            categories = categories.filter(type=category_type)

        # Build assets_map to avoid N+1 queries
        assets_map = {}
        for cat in categories:
            assets_map[cat.id] = get_assets_by_category(cat.id)

        serializer = CategoryHdRegistrationSerializer(
            categories, many=True, context={'assets_map': assets_map}
        )
        return Response(serializer.data)
#END

#SUPPLIER 
class SupplierViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Supplier.objects.filter(is_deleted=False).order_by('name')
    
    def get_serializer_class(self):
        if self.action == "names":
            return SupplierNameSerializer
        return SupplierSerializer

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
    
    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all suppliers with only name and id."""
        suppliers = self.get_queryset()
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)
#END

#DEPRECIATION
class DepreciationViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Depreciation.objects.filter(is_deleted=False).order_by('name')
    
    def get_serializer_class(self):
        if self.action == "names":
            return DepreciationNameSerializer
        return DepreciationSerializer

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

    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all depreciations with only name and id."""
        depreciations = self.get_queryset()
        serializer = self.get_serializer(depreciations, many=True)
        return Response(serializer.data)
#END

#MANUFACTURER
class ManufacturerViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Manufacturer.objects.filter(is_deleted=False).order_by('name')
    
    def get_serializer_class(self):
        if self.action == "names":
            return ManufacturerNameSerializer
        return ManufacturerSerializer

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
    
    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all manufacturers with only name and id."""
        manufacturers = self.get_queryset()
        serializer = self.get_serializer(manufacturers, many=True)
        return Response(serializer.data)

# STATUS
class StatusViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Status.objects.filter(is_deleted=False).order_by('name')
    
    def get_serializer_class(self):
        if self.action == "names":
            return StatusNameSerializer
        return StatusSerializer
    
    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        ids = list(qs.values_list('id', flat=True))
        usage_map = {}
        if ids:
            try:
                usage_map = bulk_check_usage('status', ids, sample_limit=0)
            except Exception:
                usage_map = {}

        serializer = self.get_serializer(qs, many=True, context={'status_usage': usage_map})
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        usage_map = {}
        try:
            usage_map = bulk_check_usage('status', [instance.id], sample_limit=0)
        except Exception:
            usage_map = {}
        serializer = self.get_serializer(instance, context={'status_usage': usage_map})
        return Response(serializer.data)

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
    
    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all statuses with only name and id.

        Supports optional category filter: ?category=asset or ?category=repair
        """
        statuses = self.get_queryset()
        category = request.query_params.get('category')
        if category:
            statuses = statuses.filter(category=category)
        serializer = self.get_serializer(statuses, many=True)
        return Response(serializer.data)

# LOCATION
class LocationViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Location.objects.all().order_by('city')
    
    def get_serializer_class(self):
        if self.action == "names":
            return LocationNameSerializer
        return LocationSerializer

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
    
    @action(detail=False, methods=['get'], url_path='names')
    def names(self, request):
        """Return all locations with only name and id."""
        locations = self.get_queryset()
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Employee.objects.all().order_by('firstname')
    
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action == "unresolved":
            return TicketSerializer
        return TicketSerializer

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

    # GET /tickets/by-asset/{asset_id}/?status={resolved|unresolved}
    @action(detail=False, methods=['get'], url_path='by-asset/(?P<asset_id>\d+)')
    def by_asset(self, request, asset_id=None):
        """Get the first ticket for a specific asset, optionally filtered by status"""
        status_param = request.query_params.get('status')  # 'resolved' or 'unresolved'

        qs = self.queryset.filter(asset=asset_id)

        if status_param == 'resolved':
            qs = qs.filter(is_resolved=True)
        elif status_param == 'unresolved':
            qs = qs.filter(is_resolved=False)

        ticket = qs.order_by('-created_at').first()

        if ticket:
            serializer = self.get_serializer(ticket)
            return Response(serializer.data)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
        
    # PATCH /tickets/{id}/resolve/
    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()

        action_id = request.data.get('id')
        if not action_id:
            return Response({"error": "ID is required."}, status=400)

        # If this is a checkout ticket
        if ticket.asset_checkout is None:
            ticket.asset_checkout = action_id

        # If this is a checkin ticket
        elif ticket.asset_checkout and ticket.asset_checkin is None:
            ticket.asset_checkin = action_id

        else:
            return Response({"error": "Ticket cannot be resolved or is already resolved."}, status=400)

        ticket.is_resolved = True
        ticket.save()

        # Invalidate asset cache when ticket is resolved
        if ticket.asset:
            invalidate_asset_cache(ticket.asset)

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    def perform_create(self, serializer):
        ticket = serializer.save()
        # Invalidate asset cache when a new ticket is created
        if ticket.asset:
            invalidate_asset_cache(ticket.asset)

    def perform_update(self, serializer):
        ticket = serializer.save()
        # Invalidate asset cache when ticket is updated
        if ticket.asset:
            invalidate_asset_cache(ticket.asset)

    def perform_destroy(self, instance):
        asset_id = instance.asset
        instance.delete()
        # Invalidate asset cache when ticket is deleted
        if asset_id:
            invalidate_asset_cache(asset_id)

class RecycleBinViewSet(viewsets.ViewSet):
    """Handles viewing and recovering deleted items from the Assets service"""

    def list(self, request):
        """List all deleted assets and components"""
        try:
            assets = get_deleted_assets()
        except Exception:
            assets = {"warning": "Assets service unreachable"}

        try:
            components = get_deleted_components()
        except Exception:
            components = {"warning": "Assets service unreachable"}

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

# Dropdowns for asset service
class ContextsDropdownsViewSet(viewsets.ViewSet):
    # /contexts-dropdowns/all/?entity=product
    @action(detail=False, methods=['get'])
    def all(self, request):
        entity = request.query_params.get("entity", "").lower()
        data = {}

        if entity in ["product", "asset", "component", "repair"]:
            # common dropdowns
            data["suppliers"] = SupplierNameSerializer(Supplier.objects.filter(is_deleted=False), many=True).data
        
        if entity in ["product", "component"]:
            category_type = "asset" if entity == "product" else "component"
            data["categories"] = CategoryNameSerializer(Category.objects.filter(is_deleted=False, type=category_type), many=True).data
            data["manufacturers"] = ManufacturerNameSerializer(Manufacturer.objects.filter(is_deleted=False), many=True).data
        
        if entity == "product":
            data["depreciations"] = DepreciationNameSerializer(Depreciation.objects.filter(is_deleted=False), many=True).data

        if entity == "asset":
            data["statuses"] = StatusNameSerializer(Status.objects.filter(is_deleted=False, category=Status.Category.ASSET, type__in=[Status.AssetStatusType.DEPLOYABLE, Status.AssetStatusType.UNDEPLOYABLE, Status.AssetStatusType.PENDING, Status.AssetStatusType.ARCHIVED]), many=True).data

        if entity == "repair":
            data["statuses"] = StatusNameSerializer(Status.objects.filter(is_deleted=False, category=Status.Category.REPAIR), many=True).data
            
        # individual dropdowns
        if entity == "category":
            category_type = request.query_params.get("type")  # asset or component
            
            queryset = Category.objects.filter(is_deleted=False)

            # If type is provided, filter by it
            if category_type:
                queryset = queryset.filter(type=category_type)

            data["categories"] = CategoryNameSerializer(queryset, many=True).data

        
        if entity == "supplier":
            data["suppliers"] = SupplierNameSerializer(Supplier.objects.filter(is_deleted=False), many=True).data

        if entity == "manufacturer":
            data["manufacturers"] = ManufacturerNameSerializer(Manufacturer.objects.filter(is_deleted=False), many=True).data
        
        if entity == "status":
            # Support filtering by status category and types (comma-separated)
            # ?entity=status&category=asset&types=deployable,undeployable,pending,archived
            # ?entity=status&category=repair
            status_category = request.query_params.get("category")
            status_types = request.query_params.get("types")
            status_queryset = Status.objects.filter(is_deleted=False)
            if status_category:
                status_queryset = status_queryset.filter(category=status_category)
            if status_types:
                type_list = [t.strip() for t in status_types.split(",") if t.strip()]
                if type_list:
                    status_queryset = status_queryset.filter(type__in=type_list)
            data["statuses"] = StatusNameSerializer(status_queryset, many=True).data
        
        if entity == "depreciation":
            data["depreciations"] = DepreciationNameSerializer(Depreciation.objects.filter(is_deleted=False), many=True).data
        
        if entity == "location":
            data["locations"] = LocationNameSerializer(Location.objects.all(), many=True).data

        return Response(data, status=status.HTTP_200_OK,)


# Help Desk Proxy ViewSet - proxies requests to external Help Desk service
# This allows the frontend to call the contexts service over HTTPS instead of
# calling the external Help Desk service directly over HTTP (which causes mixed content errors)
class HelpDeskLocationsProxyViewSet(viewsets.ViewSet):
    """Proxy ViewSet for Help Desk locations to avoid mixed content errors."""

    def list(self, request):
        """Proxy GET /helpdesk-locations/ to help desk service."""
        from contexts_ms.services.integration_help_desk import get_locations_list
        q = request.query_params.get('q')
        limit = request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 50
        result = get_locations_list(q=q, limit=limit)
        if isinstance(result, dict) and result.get('warning'):
            return Response({'error': result['warning']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(result)

    def retrieve(self, request, pk=None):
        """Proxy GET /helpdesk-locations/<pk>/ to help desk service."""
        from contexts_ms.services.integration_help_desk import get_location_by_id
        result = get_location_by_id(pk)
        if result is None:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
        if isinstance(result, dict) and result.get('warning'):
            return Response({'error': result['warning']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(result)


class HelpDeskEmployeesProxyViewSet(viewsets.ViewSet):
    """Proxy ViewSet for Help Desk employees to avoid mixed content errors."""

    def list(self, request):
        """Proxy GET /helpdesk-employees/ to help desk service."""
        from contexts_ms.services.integration_help_desk import fetch_resource_list
        result = fetch_resource_list('employees')
        if isinstance(result, dict) and result.get('warning'):
            return Response({'error': result['warning']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(result)

    def retrieve(self, request, pk=None):
        """Proxy GET /helpdesk-employees/<pk>/ to help desk service."""
        from contexts_ms.services.integration_help_desk import get_employee_by_id
        result = get_employee_by_id(pk)
        if result is None:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        if isinstance(result, dict) and result.get('warning'):
            return Response({'error': result['warning']}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(result)