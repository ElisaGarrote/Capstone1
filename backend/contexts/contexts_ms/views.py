from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import *
from .serializer import *
from django.db.models import Q
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

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

# MANUFACTURERS
@api_view(['GET'])
def get_all_manufacturers(request):
    manufacturers = Manufacturer.objects.filter(is_deleted=False)
    serializer = ManufacturerSerializer(manufacturers, many=True).data
    return Response(serializer)

@api_view(['GET'])
def get_manufacturer_by_id(request, id):
    try:
        manufacturer = Manufacturer.objects.get(pk=id, is_deleted=False)
    except Manufacturer.DoesNotExist:
        return Response({'detail': 'Manufacturer not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ManufacturerSerializer(manufacturer).data
    return Response(serializer)

@api_view(['POST'])
def create_manufacturer(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Manufacturer name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if Manufacturer.objects.filter(name__iexact=name, is_deleted=False).exists():
        return Response({'error': 'A Manufacturer with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)


    serializer = ManufacturerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_manufacturer(request, id):
    name = request.data.get('name')
    remove_logo = request.data.get('remove_logo') == 'true'

    # Check for duplicate name, excluding the current manufacturer
    if name and Manufacturer.objects.filter(Q(name__iexact=name), Q(is_deleted=False)).exclude(pk=id).exists():
        return Response({'error': 'A Manufacturer with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        manufacturer = Manufacturer.objects.get(pk=id, is_deleted=False)
    except Manufacturer.DoesNotExist:
        return Response({'detail': 'Manufacturer not found'}, status=status.HTTP_404_NOT_FOUND)

    # Handle logo removal
    if remove_logo and manufacturer.logo:
        manufacturer.logo.delete()
        manufacturer.logo = None

    serializer = ManufacturerSerializer(manufacturer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_manufacturer(request, id):
    try:
        manufacturer = Manufacturer.objects.get(pk=id)
        manufacturer.is_deleted = True
        manufacturer.save()
        return Response({'detail': 'Manufacturer soft-deleted'})
    except Manufacturer.DoesNotExist:
        return Response({'detail': 'Manufacturer not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_all_location(request):
    locations = Location.objects.all()
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_all_tickets(request):
    tickets = Checkout.objects.filter(is_resolved=False)
    serializer = CheckoutsSerializer(tickets, many=True)

    return Response(serializer.data)

@api_view(['PATCH'])
def resolve_ticket(request, ticket_id):
    try:
        ticket = Checkout.objects.get(pk=ticket_id)
        ticket.is_resolved = True
        ticket.save()
        return Response({'detail': 'Ticket resolved'})
    except Checkout.DoesNotExist:
        return Response({'detail': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

#SUPPLIER 
class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Supplier.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
#END

class DepreciationViewSet(viewsets.ModelViewSet):
    serializer_class = DepreciationSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Depreciation.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

