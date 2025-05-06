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