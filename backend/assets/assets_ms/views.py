from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import *

# PRODUCTS HERE
@api_view(['GET'])
def get_products(request):
    users = Product.objects.all()
    serializedData = ProductSerializer(users, many=True).data
    return Response(serializedData)

@api_view(['POST'])
def create_product(request):
    data = request.data
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_product_image(request):
    data = request.data
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# END PRODUCT


# ASSETS HERE
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

@api_view(['GET'])
@permission_classes([AllowAny]) # Set this to 'IsAuthenticated' if you want to restrict this to authenticated users.
def get_all_assets(request):
    queryset = Asset.objects.all().filter(is_deleted=False)
    serializer = AssetSerializer(queryset, many=True)
    return Response(serializer.data)
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