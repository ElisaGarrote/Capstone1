from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

@api_view(['GET'])
def get_context_names(request):
    suppliers = Supplier.objects.filter(is_deleted=False)
    categories = Category.objects.filter(is_deleted=False, type="asset")
    manufacturers = Manufacturer.objects.filter(is_deleted=False)

    serializedSupplier = SupplierNameSerializer(suppliers, many=True).data
    serializedCategory = CategoryNameSerializer(categories, many=True).data
    serializedManufacturer = ManufacturerNameSerializer(manufacturers, many=True).data

    data = {
        'suppliers': serializedSupplier,
        'categories': serializedCategory,
        'manufacturers': serializedManufacturer,
    }

    return Response(data)

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
def get_categories(request):
    catagories = Category.objects.filter(is_deleted=False)
    serializedCategories = CategorySerializer(catagories, many=True).data
    return Response(serializedCategories)

@api_view(['POST'])
def create_category(request):
    category = request.data
    serializedCategory = CategorySerializer(data=category)
    if serializedCategory.is_valid():
        serializedCategory.save()
        return Response(serializedCategory.data, status=status.HTTP_201_CREATED)
    return Response(serializedCategory.errors, status=status.HTTP_400_BAD_REQUEST)

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