from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *
from django.db.models import Q
from django.db.models import Count, Sum, F
from datetime import timedelta
from django.utils.timezone import now

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
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Product name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate name in non-deleted products
    if Product.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Product with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ProductRegistrationSerializer(data=request.data)
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

    serializer = ProductRegistrationSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Soft delete a product
@api_view(['PATCH'])
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
    serializer = AllAssetSerializer(asset, many=True)
    return Response(serializer.data)

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

# Register an asset
@api_view(['POST'])
def create_asset(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Asset name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate name in non-deleted products
    if Asset.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Product with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = AssetRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update a product
@api_view(['PUT'])
def update_asset(request, id):
    try:
        asset = Asset.objects.get(pk=id, is_deleted=False)
    except Asset.DoesNotExist:
        return Response({'detail': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and asset.image:
        asset.image.delete(save=False)
        asset.image = None

    serializer = AssetRegistrationSerializer(asset, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Get asset by id
@api_view(['GET'])
def get_asset_by_id(request, id):
    try:
        asset = Asset.objects.get(pk=id, is_deleted=False)
    except Asset.DoesNotExist:
        return Response({'detail': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

    serializedAsset = AssetSerializer(asset)

    data = {
        'asset': serializedAsset.data,
    }

    return Response(data)

#Get product defaults to be loaded to asset details
@api_view(['GET'])
def get_product_defaults(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    serializedProduct = ProductDefaultsSerializer(product)

    data = {
        'product': serializedProduct.data,
    }

    return Response(data)

# Soft delete an asset
@api_view(['PATCH'])
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
def add_asset_image(request):
    data = request.data
    serializer = AssetSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_next_asset_id(request):
    """
    Generate the next asset ID without creating an asset.
    This is for display purposes in the frontend.
    """
    # Use the same logic as in the pre_save signal
    today = datetime.date.today().strftime('%Y%m%d')
    
    # Get the highest sequential number for today
    prefix = f"AST-{today}-"
    existing_assets = Asset.objects.filter(
        displayed_id__startswith=prefix
    ).order_by('-displayed_id')
    
    if existing_assets.exists():
        # Extract the sequential number from the last asset
        last_asset = existing_assets.first()
        try:
            # Format is AST-YYYYMMDD-XXXXX-RRRR
            parts = last_asset.displayed_id.split('-')
            if len(parts) >= 3:
                seq_num = int(parts[2])
                new_seq_num = seq_num + 1
            else:
                new_seq_num = 1
        except (ValueError, IndexError):
            new_seq_num = 1
    else:
        new_seq_num = 1
    
    # Generate random suffix (4 characters)
    random_suffix = uuid.uuid4().hex[:4].upper()
    
    # Combine all parts to create the displayed_id
    next_id = f"AST-{today}-{new_seq_num:05d}-{random_suffix}"
    
    # Ensure it's exactly 20 characters
    if len(next_id) > 20:
        next_id = next_id[:20]
    elif len(next_id) < 20:
        next_id = next_id.ljust(20, '0')
    
    return Response({'next_id': next_id})
# END ASSETS

# ASSET CHECKOUT
# Get all asset checkout
@api_view(['GET'])
def get_all_asset_checkouts(request):
    assetCheckouts = AssetCheckout.objects.all()
    
    serializer = AssetCheckoutSerializer(assetCheckouts, many=True).data

    data = {
        'asset checkouts': serializer,
    }
    return Response(data)

@api_view(['GET'])
def get_asset_checkout_by_id(request, id):
    try:
        assetCheckout = AssetCheckout.objects.get(pk=id)
    except AssetCheckout.DoesNotExist:
        return Response({'detail': 'Asset Checkout not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = AssetCheckoutSerializer(assetCheckout)
    data = {
        'asset checkout': serializer.data,
    }

    return Response(data)

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
import traceback

@api_view(['POST'])
def create_asset_checkout(request):
    print("Received checkout data:", request.data)

    serializer = AssetCheckoutSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Checkout validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END ASSET CHECKOUT

# ASSET CHECKIN
@api_view(['POST'])
def create_asset_checkin(request):
    print("Received check-in data:", request.data)

    serializer = AssetCheckinSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Check-in validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END ASSET CHECKIN


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

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_audit(request):
    queryset = Audit.objects.all().filter(is_deleted=False)
    serializer = AuditSerializer(queryset, many=True)

    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_edit_audit_by_id(request, id):
    try:
        queryset = Audit.objects.get(pk=id, is_deleted=False)
    except Audit.DoesNotExist:
        return Response({'detail': 'Audit not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AuditSerializer(queryset)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AuditSerializer(queryset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Audit Files
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
def get_all_audit_files(request):
    queryset = AuditFile.objects.all().filter(is_deleted=False)
    serializer = AuditFileSerializer(queryset, many=True)

    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def soft_delete_audit_files(request, id):
    audit_files = AuditFile.objects.filter(audit=id, is_deleted=False)
    if not audit_files.exists():
        return Response({'detail': 'Audit file not found'}, status=status.HTTP_404_NOT_FOUND)
    audit_files.update(is_deleted=True)
    return Response({'detail': 'Audit files soft-deleted'}, status=status.HTTP_200_OK)

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

@api_view(['PATCH'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def soft_delete_schedule_audit(request, id):
    try:
        schedule_audit = AuditSchedule.objects.get(pk=id, is_deleted=False)
        schedule_audit.is_deleted = True
        schedule_audit.save()
        return Response({'detail': 'Audit schedule soft delete successfully'})
    except AuditSchedule.DoesNotExist:
        return Response({'detail': 'Audit schedule not found'}, status=status.HTTP_404_NOT_FOUND)
# END AUDITS

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

# Soft Delete Status
# Soft delete a product
@api_view(['PATCH'])
def soft_delete_status(request, id):
    try:
        status = Status.objects.get(pk=id)
        status.is_deleted = True
        status.save()
        return Response({'detail': 'Status soft-deleted'})
    except Product.DoesNotExist:
        return Response({'detail': 'Status not found'}, status=status.HTTP_404_NOT_FOUND)

# END STATUS

# CATEGORY
@api_view(['GET'])
def get_all_category(request):
    category = AssetCategory.objects.filter(is_deleted=False)
    serializer = AssetCategorySerializer(category, many=True).data

    data = {
        'category': serializer,
    }
    return Response(data)

@api_view(['GET'])
def get_category_by_id(request, id):
    try:
        category = AssetCategory.objects.get(pk=id, is_deleted=False)
    except AssetCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AssetCategorySerializer(category)

    data = {
        'category': serializer.data,
    }

    return Response(data)

@api_view(['POST'])
def create_category(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate name in non-deleted categories
    if AssetCategory.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = AssetCategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_category(request, id):
    try:
        category = AssetCategory.objects.get(pk=id, is_deleted=False)
    except AssetCategory.DoesNotExist:
        return Response({'detail': 'Categoroy not found'}, status=status.HTTP_404_NOT_FOUND)

    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and category.logo:
        category.logo.delete(save=False)
        category.logo = None

    serializer = AssetCategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_category(request, id):
    try:
        category = AssetCategory.objects.get(pk=id)
        category.is_deleted = True
        category.save()
        return Response({'detail': 'Category soft-deleted'})
    except AssetCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
# END CATEGORY

# DEPRECIATION
@api_view(['GET'])
def get_all_depreciation(request):
    depreciation = Depreciation.objects.filter(is_deleted=False)
    serializer = DepreciationSerializer(depreciation, many=True).data

    data = {
        'depreciation': serializer,
    }
    return Response(data)

@api_view(['GET'])
def get_depreciation_by_id(request, id):
    try:
        depreciation = Depreciation.objects.get(pk=id, is_deleted=False)
    except Depreciation.DoesNotExist:
        return Response({'detail': 'Depreciation not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DepreciationSerializer(depreciation)

    data = {
        'depreciation': serializer.data,
    }

    return Response(data)

@api_view(['POST'])
def create_depreciation(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Depreciation name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate name in non-deleted categories
    if Depreciation.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Depreciation with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = DepreciationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_depreciation(request, id):
    try:
        depreciation = Depreciation.objects.get(pk=id, is_deleted=False)
    except Depreciation.DoesNotExist:
        return Response({'detail': 'Depreciation not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = DepreciationSerializer(depreciation, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_depreciation(request, id):
    try:
        depreciation = Depreciation.objects.get(pk=id)
        depreciation.is_deleted = True
        depreciation.save()
        return Response({'detail': 'Depreciation soft-deleted'})
    except Depreciation.DoesNotExist:
        return Response({'detail': 'Depreciation not found'}, status=status.HTTP_404_NOT_FOUND)
# END DEPRECIATION

# COMPONENT
@api_view(['GET'])
def get_all_components(request):
    components = Component.objects.filter(is_deleted=False)
    serializer = AllComponentSerializer(components, many=True).data
    return Response(serializer)

@api_view(['GET'])
def get_component_by_id(request, id):
    try:
        component = Component.objects.get(pk=id, is_deleted=False)
    except Component.DoesNotExist:
        return Response({'detail': 'Component not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ComponentSerializer(component).data
    return Response(serializer)

@api_view(['POST'])
def create_component(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Component name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if Component.objects.filter(name__iexact=name, is_deleted=False).exists():
        return Response({'error': 'A Component with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)


    serializer = ComponentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_component(request, id):
    name = request.data.get('name')
    remove_image = request.data.get('remove_logo') == 'true'

    # Check for duplicate name, excluding the current component
    if name and Component.objects.filter(Q(name__iexact=name), Q(is_deleted=False)).exclude(pk=id).exists():
        return Response({'error': 'A Component with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        component = Component.objects.get(pk=id, is_deleted=False)
    except Component.DoesNotExist:
        return Response({'detail': 'Component not found'}, status=status.HTTP_404_NOT_FOUND)

    # Handle image removal
    if remove_image and component.image:
        component.image.delete(save=False)
        component.image = None

    serializer = ComponentSerializer(component, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_component(request, id):
    try:
        component = Component.objects.get(pk=id)
        component.is_deleted = True
        component.save()
        return Response({'detail': 'Component soft-deleted'})
    except Component.DoesNotExist:
        return Response({'detail': 'Component not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_component_registration_contexts(request):
    categories = ComponentCategory.objects.filter(is_deleted=False)
    manufacturers = Manufacturer.objects.filter(is_deleted=False)

    category_serializer = ComponentCategoryNameSerializer(categories, many=True)
    manufacturer_serializer = ManufacturerNameSerializer(manufacturers, many=True)

    data = {
        'category': category_serializer.data,
        'manufacturer': manufacturer_serializer.data
    }
    return Response(data)

@api_view(['GET'])
def get_asset_names(request):
    assets = Asset.objects.filter(is_deleted=False)
    serializer = AssetNameSerializer(assets, many=True).data
    return Response(serializer)

@api_view(['GET'])
def pending_component_checkouts(request, component_id):
    try:
        component = Component.objects.get(id=component_id)
    except Component.DoesNotExist:
        return Response({"detail": "Component not found."}, status=404)

    # Get all pending checkouts for this component
    pending_checkouts = ComponentCheckout.objects.filter(
        component=component,
        component_checkins__isnull=True
    )

    checkout_serializer = ComponentCheckoutSerializer(pending_checkouts, many=True)

    data = {
        "id": component.id,
        "name": component.name,
        "image": request.build_absolute_uri(component.image.url) if component.image else None,
        "pending_checkouts": checkout_serializer.data
    }

    return Response(data)

@api_view(['POST'])
def create_component_checkout(request):
    print("Received checkout data:", request.data)

    serializer = ComponentCheckoutSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Checkout validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_component_checkin(request):
    print("Received checkin data:", request.data)

    serializer = ComponentCheckinSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Checkin validation errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END COMPONENT

# REPAIR
@api_view(['POST'])
def create_repair(request):
    data = request.data
    serializers = RepairSerializer(data=data)
    if serializers.is_valid():
        serializers.save()
        return Response(serializers.data, status=status.HTTP_201_CREATED)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_repair(request):
    queryset = Repair.objects.all().filter(is_deleted=False)
    serializer = RepairSerializer(queryset, many=True)

    return Response(serializer.data)

@api_view(['PUT'])
def update_repair(request, id):
    try:
        repair = Repair.objects.get(pk=id, is_deleted=False)
    except Repair.DoesNotExist:
        return Response({'detail': 'Repair not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RepairSerializer(repair, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_repair(request, id):
    try:
        repair = Repair.objects.get(pk=id)
        repair.is_deleted = True
        repair.save()
        return Response({'detail': 'Repair soft-deleted'})
    except Repair.DoesNotExist:
        return Response({'detail': 'Repair not found'}, status=status.HTTP_404_NOT_FOUND)

# Repair file
@api_view(['POST'])
def create_repair_file(request):
    data = request.data
    serializers = RepairFileSerializer(data=data)
    if serializers.is_valid():
        serializers.save()
        return Response(serializers.data, status=status.HTTP_201_CREATED)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_repair_file_by_id(request, id):
    "Delete repair file by id."
    try:
        repair_file = RepairFile.objects.get(pk=id, is_deleted=False)
        repair_file.is_deleted = True
        repair_file.save()
        return Response({'detail': 'Repair file soft-deleted'})
    except RepairFile.DoesNotExist:
        return Response({'detail': 'Repair file not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
def soft_delete_repair_file_by_repair_id(request, id):
    "Delete all repair files by repair id."
    try:
        repair_files = RepairFile.objects.filter(repair=id, is_deleted=False)
        repair_files.update(is_deleted=True)
        return Response({'detail': 'Repair files soft-deleted'})
    except RepairFile.DoesNotExist:
        return Response({'detail': 'Repair files not found'}, status=status.HTTP_404_NOT_FOUND)
# END REPAIR

@api_view(['GET'])
def get_dashboard_stats(request):
    today = now().date()

    due_returns = AssetCheckout.objects.filter(
        return_date__gte=today,
        asset_checkins__isnull=True
    ).count()

    overdue_returns = AssetCheckout.objects.filter(
        return_date__lt=today,
        asset_checkins__isnull=True
    ).count()

    upcoming_audits = AuditSchedule.objects.filter(
        date__range=(today, today + timedelta(days=7)),
        is_deleted=False
    ).count()

    overdue_audits = AuditSchedule.objects.filter(
        date__lt=today,
        is_deleted=False
    ).exclude(asset_audits__isnull=False).count()

    reached_eol = Asset.objects.filter(
        product__end_of_life__lt=today,
        is_deleted=False
    ).count()

    upcoming_eol = Asset.objects.filter(
        product__end_of_life__range=(today, today + timedelta(days=30)),
        is_deleted=False
    ).count()

    expired_warranties = Asset.objects.filter(
        warranty_expiration__lt=today,
        is_deleted=False
    ).count()

    expiring_warranties = Asset.objects.filter(
        warranty_expiration__range=(today, today + timedelta(days=30)),
        is_deleted=False
    ).count()

    low_stock = Component.objects.filter(
        quantity__lte=F('minimum_quantity'),
        is_deleted=False
    ).count()

    total_cost = Asset.objects.filter(
        purchase_date__month=today.month,
        purchase_date__year=today.year,
        is_deleted=False
    ).aggregate(total=Sum('purchase_cost'))['total'] or 0

    total_assets = Asset.objects.filter(is_deleted=False).count()
    deployed_assets = Asset.objects.filter(status__type='deployed', is_deleted=False).count()
    utilization = round((deployed_assets / total_assets) * 100) if total_assets > 0 else 0

    # Pie chart data
    category_counts = Asset.objects.filter(is_deleted=False).values('product__category__name').annotate(count=Count('id'))
    status_counts = Asset.objects.filter(is_deleted=False).values('status__name').annotate(count=Count('id'))

    data = {
        "due_for_return": due_returns,
        "overdue_for_return": overdue_returns,
        "upcoming_audits": upcoming_audits,
        "overdue_audits": overdue_audits,
        "reached_end_of_life": reached_eol,
        "upcoming_end_of_life": upcoming_eol,
        "expired_warranties": expired_warranties,
        "expiring_warranties": expiring_warranties,
        "low_stock": low_stock,
        "total_asset_costs": total_cost,
        "asset_utilization": utilization,
        "asset_categories": list(category_counts),
        "asset_statuses": list(status_counts),
    }

    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)