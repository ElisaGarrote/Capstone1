from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import CustomUser
from .serializers import RegisterSerializer

@api_view(['GET'])
def api_test(request):
    return Response({"message": "API is working!"}, status=status.HTTP_200_OK)

class RegisterViewset(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post', 'get']  # Allow POST and GET requests
    
    def list(self, request):
        """Handle GET requests to /register/"""
        return Response({
            "message": "Superuser registration endpoint. Send a POST request with user data to register a superuser.",
            "required_fields": {
                "email": "Your email address",
                "password": "Your password",
                "password2": "Confirm your password"
            }
        })
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to /register/ to create a superuser"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_superuser=True, is_staff=True)
        return Response({
            "email": user.email,
            "message": "Superuser created successfully",
        }, status=status.HTTP_201_CREATED)
