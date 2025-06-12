from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# Gets all accessories data
@api_view(['GET'])
def get_accessories(request):
    accessories = Accessory.objects.filter(is_deleted=False)
    serializer = AllAccessorySerializer(accessories, many=True)

    data = {
        'accessories': serializer.data
    }
    return Response(data, status=status.HTTP_200_OK)

# Get accessory category names
@api_view(['GET'])
def get_accessory_contexts(request):
    categories = AccessoryCategory.objects.filter(is_deleted=False)
    serializedCategories = AccessoryCategoryNameSerializer(categories, many=True).data

    data = {
        'categories': serializedCategories,
    }
    return Response(data)

# Gets an accessory by id
@api_view(['GET'])
def get_accessory_by_id(request, id):
    try:
        accessory = Accessory.objects.get(pk=id, is_deleted=False)
    except Accessory.DoesNotExist:
        return Response({'error': 'Accessory not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializedAccessory = AccessorySerializer(accessory)

    data = {
        'accessory': serializedAccessory.data,
    }

    return Response(data)

# Gets all accessory names
@api_view(['GET'])
def get_accessory_names(request):
    accessories = Accessory.objects.filter(is_deleted=False)
    serializedAccessories = AccessoryNameSerializer(accessories, many=True).data

    data = {
        'accessories': serializedAccessories,
    }
    return Response(data)

# Creates an accessory
@api_view(['POST'])
def create_accessory(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Accessory name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate name in non-deleted accessories
    if Accessory.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'An accessory with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # Proceed with creation
    serializer = AccessoryRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Updates an accessory
@api_view(['PUT'])
def update_accessory(request, id):
    try:
        accessory = Accessory.objects.get(pk=id, is_deleted=False)
    except Accessory.DoesNotExist:
        return Response({'detail': 'Accessory not found'}, status=status.HTTP_404_NOT_FOUND)
    
    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and accessory.image:
        accessory.image.delete(save=False)
        accessory.image = None

    serializer = AccessoryRegistrationSerializer(accessory, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Soft deletes an accessory
@api_view(['PATCH'])
def soft_delete_accessory(request, id):
    try:
        accessory = Accessory.objects.get(pk=id, is_deleted=False)
    except Accessory.DoesNotExist:
        return Response({'error': 'Accessory not found.'}, status=status.HTTP_404_NOT_FOUND)

    accessory.is_deleted = True
    accessory.save()
    return Response({'message': 'Accessory soft-deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

# Create accessory checkout
@api_view(['POST'])
def create_accessory_checkout(request):
    data = request.data
    serializer = AccessoryCheckoutSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_accessory_checkout(request):
    queryset = AccessoryCheckout.objects.all()
    serializer = AccessoryCheckoutSerializer(queryset, many=True)

    return Response(serializer.data)

# Create accessory checkin
@api_view(['POST'])
def create_accessory_checkin(request):
    data = request.data
    serializer = AccessoryCheckinSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_accessory_checkin(request):
    queryset = AccessoryCheckin.objects.all()
    serializer = AccessoryCheckinSerializer(queryset, many=True)

    return Response(serializer.data)

# CATEGORY
@api_view(['GET'])
def get_all_category(request):
    category = AccessoryCategory.objects.filter(is_deleted=False)
    serializer = AccessoryCategorySerializer(category, many=True).data

    data = {
        'category': serializer,
    }
    return Response(data)

@api_view(['GET'])
def get_category_by_id(request, id):
    try:
        category = AccessoryCategory.objects.get(pk=id, is_deleted=False)
    except AccessoryCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AccessoryCategorySerializer(category)

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
    if AccessoryCategory.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = AccessoryCategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_category(request, id):
    try:
        category = AccessoryCategory.objects.get(pk=id, is_deleted=False)
    except AccessoryCategory.DoesNotExist:
        return Response({'detail': 'Categoroy not found'}, status=status.HTTP_404_NOT_FOUND)

    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and category.logo:
        category.logo.delete(save=False)
        category.logo = None

    serializer = AccessoryCategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_category(request, id):
    try:
        category = AccessoryCategory.objects.get(pk=id)
        category.is_deleted = True
        category.save()
        return Response({'detail': 'Category soft-deleted'})
    except AccessoryCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
# END CATEGORY