from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'password2')
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 from validated_data
        validated_data.pop('password2', None)
        
        # Get password
        password = validated_data.pop('password')
        
        # Create user with remaining data
        user = CustomUser(
            email=validated_data.get('email'),
            is_superuser=True,
            is_staff=True,
            is_active=True
        )
        
        # Set password
        user.set_password(password)
        user.save()
        
        return user
