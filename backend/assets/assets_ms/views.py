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