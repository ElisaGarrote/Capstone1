from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# consumables_ms/views.py
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

# CATEGORY
@api_view(['GET'])
def get_all_category(request):
    category = ConsumableCategory.objects.filter(is_deleted=False)
    serializer = ConsumableCategorySerializer(category, many=True).data

    data = {
        'category': serializer,
    }
    return Response(data)

@api_view(['GET'])
def get_category_by_id(request, id):
    try:
        category = ConsumableCategory.objects.get(pk=id, is_deleted=False)
    except ConsumableCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConsumableCategorySerializer(category)

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
    if ConsumableCategory.objects.filter(name=name, is_deleted=False).exists():
        return Response({'error': 'A Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ConsumableCategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_category(request, id):
    try:
        category = ConsumableCategory.objects.get(pk=id, is_deleted=False)
    except ConsumableCategory.DoesNotExist:
        return Response({'detail': 'Categoroy not found'}, status=status.HTTP_404_NOT_FOUND)

    remove_image = request.data.get('remove_image')
    if remove_image == 'true' and category.logo:
        category.logo.delete(save=False)
        category.logo = None

    serializer = ConsumableCategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def soft_delete_category(request, id):
    try:
        category = ConsumableCategory.objects.get(pk=id)
        category.is_deleted = True
        category.save()
        return Response({'detail': 'Category soft-deleted'})
    except ConsumableCategory.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
# END CATEGORY
