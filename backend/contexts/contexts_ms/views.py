from rest_framework import viewsets
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import action
from contexts.services.assets import *
from rest_framework import status
from contexts.services.usage_check import is_item_in_use


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
        if is_item_in_use("supplier", instance.id):
            raise serializers.ValidationError(
                {"error": "Cannot delete supplier. It is still used in assets or components."}
            )
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
        if is_item_in_use("depreciation", instance.id):
            raise serializers.ValidationError(
                {"error": "Cannot delete depreciation. It is still used in assets."}
            )
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
        if is_item_in_use("manufacturer", instance.id):
            raise serializers.ValidationError(
                {"error": "Cannot delete manufacturer. It is still used in assets or components."}
            )
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
        if is_item_in_use("status", instance.id):
            raise serializers.ValidationError({"error": "Cannot delete status. It is still used in assets."})
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
        if is_item_in_use("location", instance.id):
            raise serializers.ValidationError({"error": "Cannot delete location. It is still referenced."})
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
        data = recover_asset(pk)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def recover_component(self, request, pk=None):
        """Recover component"""
        data = recover_component(pk)
        return Response(data, status=status.HTTP_200_OK)

