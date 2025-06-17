from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

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
    suppliers = Supplier.objects.filter(is_deleted=False)
    manufacturers = Manufacturer.objects.filter(is_deleted=False)

    serializedSupplier = SupplierNameSerializer(suppliers, many=True).data
    serializedManufacturer = ManufacturerNameSerializer(manufacturers, many=True).data

    data = {
        'suppliers': serializedSupplier,
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

#Get supplier name by id.
@api_view(['GET'])
def get_supp_name_by_id(request, id):
    try:
        supplier = Supplier.objects.get(pk=id, is_deleted=False)
    except Supplier.DoesNotExist:
        return Response({'detail': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializedData = SupplierNameSerializer(supplier)

    data = {
        'supplier': serializedData.data,
    }

    return Response(data)

#SUPPLIERS DATA
# Get all supplier's names
@api_view(['GET'])
def get_suppliers_names(request):
    supplier = Supplier.objects.filter(is_deleted=False)
    serializedSupplier = SupplierNameSerializer(supplier, many=True).data

    data = {
        'suppliers': serializedSupplier,
    }
    return Response(data)

@api_view(['GET'])
def get_supplier(request):
    suppliers = Supplier.objects.filter(is_deleted=False)
    serialized_suppliers = SupplierSerializer(suppliers, many=True)
    return Response({'suppliers': serialized_suppliers.data})

# Register supplier 
@api_view(['POST'])
def create_supplier(request):
    serializedSupplier = SupplierSerializer()
    data = request.data
    serializer = SupplierSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def soft_delete_supplier(request, id):
    try:
        supplier = Supplier.objects.get(pk=id)
        supplier.is_deleted = True
        supplier.save()
        return Response({'detail': 'Supplier soft-deleted'})
    except Supplier.DoesNotExist:
        return Response({'detail': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)

# Get all suppliers
@api_view(['GET'])
def get_suppliers(request):
    suppliers = Supplier.objects.filter(is_deleted=False) # Filters not deleted instances
    serializedSuppliers = SupplierSerializer(suppliers, many=True).data # Serializes data
    return Response(serializedSuppliers) # Returns serialized data

@api_view(['POST'])
def create_supplier(request):
    supplier = request.data
    serializedSupplier = SupplierSerializer(data=supplier)
    if serializedSupplier.is_valid():
        serializedSupplier.save()
        return Response(serializedSupplier.data, status=status.HTTP_201_CREATED)
    return Response(serializedSupplier.errors, status=status.HTTP_400_BAD_REQUEST)

# MANUFACTURERS
@api_view(['GET'])
def get_all_manufacturers(request):
    manufacturers = Manufacturer.objects.filter(is_deleted=False)
    serializer = ManufacturerSerializer(manufacturers, many=True).data
    return Response(serializer)

@api_view(['POST'])
def create_manufacturer(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Manufacturer name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if Manufacturer.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Manufacturer with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ManufacturerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_manufacturer(request, id):
    name = request.data.get('name')

    if Manufacturer.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Manufacturer with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        manufacturer = Manufacturer.objects.get(pk=id, is_deleted=False)
    except Manufacturer.DoesNotExist:
        return Response({'detail': 'Manufacturer not found'}, status=status.HTTP_404_NOT_FOUND)

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