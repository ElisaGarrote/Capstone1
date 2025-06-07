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

#Get supplier name by id
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

@api_view(['GET'])
def get_manufacturers(request):
    manufacturers = Manufacturer.objects.filter(is_deleted=False)
    serializedManufacturers = ManufacturerSerializer(manufacturers, many=True).data
    return Response(serializedManufacturers)

@api_view(['POST'])
def create_manufacturer(request):
    manufacturer = request.data
    serializedManufacturer = ManufacturerSerializer(data=manufacturer)
    if serializedManufacturer.is_valid():
        serializedManufacturer.save()
        return Response(serializedManufacturer.data, status=status.HTTP_201_CREATED)
    return Response(serializedManufacturer.errors, status=status.HTTP_400_BAD_REQUEST)