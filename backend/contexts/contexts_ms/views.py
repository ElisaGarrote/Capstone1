from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import *
from .serializer import *
from django.db.models import Q
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

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
        instance.is_deleted = True
        instance.save()

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
