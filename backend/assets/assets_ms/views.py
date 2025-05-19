from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# Get all products
@api_view(['GET'])
def get_products(request):
    products = Product.objects.filter(is_deleted=False)
    serializedProducts = AllProductSerializer(products, many=True).data
    return Response(serializedProducts)

@api_view(['GET', 'PUT'])
def get_product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id, is_deleted=False)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Check for image removal flag
        remove_image = request.data.get('remove_image')
        if remove_image == 'true' and product.image:
            product.image.delete(save=False)
            product.image = None

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_product_depreciations(request):
    depreciations = Depreciation.objects.filter(is_deleted=False)
    serializedDepreciations = ProductDepreciationSerializer(depreciations, many=True).data
    return Response(serializedDepreciations)

@api_view(['POST'])
def create_product(request):
    data = request.data
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Repair CRUD operations
@api_view(['GET'])
def get_repairs(request):
    repairs = Repair.objects.filter(is_deleted=False)
    serializer = RepairListSerializer(repairs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_repair_by_id(request, id):
    try:
        repair = Repair.objects.get(pk=id, is_deleted=False)
    except Repair.DoesNotExist:
        return Response({'detail': 'Repair not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RepairSerializer(repair)
    return Response(serializer.data)

@api_view(['POST'])
def create_repair(request):
    serializer = RepairSerializer(data=request.data)
    if serializer.is_valid():
        repair = serializer.save()
        
        # Handle file uploads if any
        files = request.FILES.getlist('files')
        for file in files:
            RepairFile.objects.create(repair=repair, file=file)
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_repair(request, id):
    try:
        repair = Repair.objects.get(pk=id, is_deleted=False)
    except Repair.DoesNotExist:
        return Response({'detail': 'Repair not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RepairSerializer(repair, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        
        # Handle file uploads if any
        files = request.FILES.getlist('files')
        for file in files:
            RepairFile.objects.create(repair=repair, file=file)
            
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_repair(request, id):
    try:
        repair = Repair.objects.get(pk=id)
    except Repair.DoesNotExist:
        return Response({'detail': 'Repair not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Soft delete
    repair.is_deleted = True
    repair.save()
    return Response({'detail': 'Repair deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_repair_file(request, repair_id, file_id):
    try:
        repair_file = RepairFile.objects.get(pk=file_id, repair_id=repair_id)
    except RepairFile.DoesNotExist:
        return Response({'detail': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Delete the file
    repair_file.file.delete(save=False)
    repair_file.delete()
    return Response({'detail': 'File deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_repairs_by_asset(request, asset_id):
    repairs = Repair.objects.filter(asset_id=asset_id, is_deleted=False)
    serializer = RepairListSerializer(repairs, many=True)
    return Response(serializer.data)