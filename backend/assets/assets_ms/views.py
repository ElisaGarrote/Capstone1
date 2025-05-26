from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# PRODUCTS HERE
# Get products for all products table
@api_view(['GET'])
def get_all_products(request):
    products = Product.objects.filter(is_deleted=False)
    serializedProducts = AllProductSerializer(products, many=True).data

    data = {
        'products': serializedProducts,
    }
    return Response(data)

# Get contexts for product registration
@api_view(['GET'])
def get_product_contexts(request):
    categories = AssetCategory.objects.filter(is_deleted=False)
    depreciations = Depreciation.objects.filter(is_deleted=False)

    serializedCategories = AssetCategoryNameSerializer(categories, many=True).data
    serializedDepreciations = DepreciationNameSerializer(depreciations, many=True).data

    data = {
        'categories': serializedCategories,
        'depreciations': serializedDepreciations,
    }
    return Response(data)

# Get product by id
@api_view(['GET'])
def get_product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id, is_deleted=False)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    serializedProduct = ProductSerializer(product)

    data = {
        'product': serializedProduct.data,
    }

    return Response(data)

# Register a product
@api_view(['POST'])
def create_product(request):
    data = request.data
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update a product
@api_view(['PUT'])
def update_product(request, id):
    try:
        product = Product.objects.get(pk=id, is_deleted=False)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and product.image:
        product.image.delete(save=False)
        product.image = None

    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Soft delete a product
@api_view(['DELETE'])
def soft_delete_product(request, id):
    try:
        product = Product.objects.get(pk=id)
        product.is_deleted = True
        product.save()
        return Response({'detail': 'Product soft-deleted'})
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

# Get all product names
@api_view(['GET'])
def get_product_names(request):
    products = Product.objects.filter(is_deleted=False)
    serializedProducts = ProductNameSerializer(products, many=True).data

    data = {
        'products': serializedProducts,
    }
    return Response(data)
# END PRODUCT


# ASSETS HERE
# Get all assets
@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_assets(request):
    asset = Asset.objects.filter(is_deleted=False)
    serializer = AllAssetSerializer(asset, many=True).data

    data = {
        'assets': serializer,
    }
    return Response(data)

# Get products and statuses for asset registration
@api_view(['GET'])
def get_asset_contexts(request):
    products = Product.objects.filter(is_deleted=False)
    statuses = Status.objects.filter(is_deleted=False)

    serializedProducts = ProductNameSerializer(products, many=True).data
    serializedStatuses = StatusNameSerializer(statuses, many=True).data

    data = {
        'products': serializedProducts,
        'statuses': serializedStatuses,
    }
    return Response(data)

# Soft delete an asset
@api_view(['DELETE'])
def soft_delete_asset(request, id):
    try:
        asset = Asset.objects.get(pk=id)
        asset.is_deleted = True
        asset.save()
        return Response({'detail': 'Asset soft-deleted'})
    except Asset.DoesNotExist:
        return Response({'detail': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def create_asset(request):
    data = request.data
    serializer = AssetSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def add_asset_image(request):
    data = request.data
    serializer = AssetSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END ASSETS


# AUDITS HERE
# Audit
@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def create_audit(request):
    data = request.data
    serializer = AuditSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def add_audit_file(request):
    data = request.data
    serializer = AuditFileSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_audit(request):
    queryset = Audit.objects.all().filter(is_deleted=False)
    serializer = AuditSerializer(queryset, many=True)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_audit_files(request):
    queryset = AuditFile.objects.all().filter(is_deleted=False)
    serializer = AuditFileSerializer(queryset, many=True)

    return Response(serializer.data)

# Schedule Audit
@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def create_audit_schedule(request):
    data = request.data
    serializer = AuditScheduleSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_audit_schedules(request):
    queryset = AuditSchedule.objects.all().filter(is_deleted=False)
    serializer = AuditScheduleSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_edit_audit_schedule_by_id(request, id):
    try:
        queryset = AuditSchedule.objects.get(pk=id, is_deleted=False)
    except AuditSchedule.DoesNotExist:
        return Response({'detail': 'Audit schedule not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AuditScheduleSerializer(queryset)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AuditScheduleSerializer(queryset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# END AUDITS


# COMPONENT
@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def create_component(request):
    data = request.data
    serializer = ComponentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END COMPONENT

# STATUS
@api_view(['POST'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def create_status(request):
    data = request.data
    serializer = StatusSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_edit_status_by_id(request, id):
    try:
        queryset = Status.objects.get(pk=id, is_deleted=False)
    except Status.DoesNotExist:
        return Response({'detail': 'Status not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StatusSerializer(queryset)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = StatusSerializer(queryset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_status(request):
    queryset = Status.objects.all().filter(is_deleted=False)
    serializer = StatusSerializer(queryset, many=True)
    return Response(serializer.data)

# END STATUS