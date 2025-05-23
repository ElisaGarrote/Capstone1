from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from .models import CustomUser
from .serializers import RegisterSerializer

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
