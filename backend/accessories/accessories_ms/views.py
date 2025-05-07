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

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.filter(is_deleted=False)
    serializer = CategorySerializer(categories, many=True).data
    return Response(serializer)

@api_view(['PUT'])
def soft_delete_accessory(request, id):
    try:
        accessory = Accessory.objects.get(pk=id)
        accessory.is_deleted = True
        accessory.save()
        return Response({'detail': 'Accessory soft-deleted'})
    except Accessory.DoesNotExist:
        return Response({'detail': 'Accessory not found'}, status=status.HTTP_404_NOT_FOUND)
