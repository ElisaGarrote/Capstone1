from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

@api_view(['GET'])
def api_test(request):
    return Response({"message": "API is working!"}, status=status.HTTP_200_OK)

class RegisterViewset(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post', 'get']  # Allow POST and GET requests
    
    def list(self, request):
        """Handle GET requests to /register/"""
        return Response({
            "message": "Registration endpoint. Send a POST request with user data to register.",
            "required_fields": {
                "username": "Your username",
                "email": "Your email address",
                "password": "Your password",
                "password2": "Confirm your password",
                "first_name": "Your first name",
                "last_name": "Your last name"
            }
        })
    
    def create(self, request, *args, **kwargs):
        """Handle POST requests to /register/"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": serializer.data,
            "message": "User created successfully",
        }, status=status.HTTP_201_CREATED)
