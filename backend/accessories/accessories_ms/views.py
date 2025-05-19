from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# Create your views here.
@api_view(['GET'])
def get_accessories(request):
    accessories = Accessory.objects.filter(is_deleted=False)
    serializer = AllAccessorySerializer(accessories, many=True).data
    return Response(serializer)

@api_view(['POST'])
def create_accessory(request):
    data = request.data
    serializer = AccessorySerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def get_accessory_by_id(request, id):
    try:
        accessory = Accessory.objects.get(pk=id, is_deleted=False)
    except Accessory.DoesNotExist:
        return Response({'detail': 'Accessory not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AccessorySerializer(accessory)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Check for image removal flag
        remove_image = request.data.get('remove_image')
        if remove_image == 'true' and accessory.image:
            accessory.image.delete(save=False)
            accessory.image = None

        serializer = AccessorySerializer(accessory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def soft_delete_accessory(request, id):
    try:
        accessory = Accessory.objects.get(pk=id)
        accessory.is_deleted = True
        accessory.save()
        return Response({'detail': 'Accessory soft-deleted'})
    except Accessory.DoesNotExist:
        return Response({'detail': 'Accessory not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.filter(is_deleted=False)
    serializer = AccessoryCategorySerializer(categories, many=True).data
    return Response(serializer)
