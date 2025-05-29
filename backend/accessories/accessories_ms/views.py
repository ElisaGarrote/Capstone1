from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# Gets all accessories
@api_view(['GET'])
def get_accessories(request):
    accessories = Accessory.objects.filter(is_deleted=False)
    serializer = AllAccessorySerializer(accessories, many=True)
    return Response({
        'message': 'All accessories table content:',
        'data': serializer.data
    }, status=200)

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
    serializer = AccessorySerializer(data=request.data)
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

    serializer = AccessorySerializer(accessory, data=request.data, partial=True)
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

# Gets all categories of accessories
@api_view(['GET'])
def get_accessory_categories(request):
    categories = AccessoryCategory.objects.filter(is_deleted=False)
    serializer = AccessoryCategorySerializer(categories, many=True)
    return Response({
        'message': 'All accessory categories:',
        'data': serializer.data
    }, status=200)

# Filters not deleted accessories
# If AccessoryCategory.name is not equal to any of the filtered categories, it will create a new AccessoryCategory
@api_view(['POST'])
def create_accessory_category(request):
    name = request.data.get('name')

    if not name:
        return Response({'error': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    exists = AccessoryCategory.objects.filter(name=name, is_deleted=False).exists()

    if not exists:
        serializer = AccessoryCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'message': 'Category already exists and is not deleted.'}, status=status.HTTP_200_OK)

# Edits a category of accessory
@api_view(['PUT'])
def update_accessory_category(request, id):
    try:
        category = AccessoryCategory.objects.get(pk=id)
    except AccessoryCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AccessoryCategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Soft deletes a category of accessory
@api_view(['PATCH'])
def soft_delete_accessory_category(request, id):
    try:
        category = AccessoryCategory.objects.get(pk=id, is_deleted=False)
    except AccessoryCategory.DoesNotExist:
        return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

    category.is_deleted = True
    category.save()
    return Response({'message': 'Category soft-deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
