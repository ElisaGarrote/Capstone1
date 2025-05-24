from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from rest_framework.permissions import AllowAny
from .models import CustomUser
from .serializers import *

@api_view(['GET'])
def api_test(request):
    return Response({"message": "API is working!"}, status=status.HTTP_200_OK)

class RegisterViewset(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    http_method_names = ['post', 'get']
    
    def list(self, request):
        return Response({
            "message": "Superuser registration endpoint",
            "required_fields": {
                "email": "Your email address",
                "password": "Your password",
                "password2": "Confirm your password"
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "email": user.email,
                "message": "Superuser created successfully"
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsersViewset(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    # List of all urls for users viewset.
    def list(self, request):
        base_url = request.build_absolute_uri().rstrip('/')

        # Generate URL for actions
        has_active_url = self.reverse_action(self.has_active_admin.url_name)

        return Response({
            "has_active_admin": has_active_url,
            "update_user": f'{base_url}/pk',
        })

    # Update auth account by pk
    def update(self, request, pk=None):
        queryset = self.queryset.filter(pk=pk, is_active=True).first()
        if queryset:
            serializer = self.get_serializer(queryset)
            return Response(serializer.data)
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Determine if there is any active admin.
    @action(detail=False, methods=['get'])
    def has_active_admin(self, request):
        has_active_admin = self.queryset.filter(is_active=True, is_superuser=True).exists()

        return Response(has_active_admin)
    
