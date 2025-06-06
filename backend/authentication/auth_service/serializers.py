from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'first_name', 'middle_name', 
            'last_name', 'role', 'contact_number', 'image',
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'middle_name': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        user = User.objects.create_superuser(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email')
