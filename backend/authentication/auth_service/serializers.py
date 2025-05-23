from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
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
        validated_data.pop('password2')
        is_superuser = validated_data.pop('is_superuser', False)
        is_staff = validated_data.pop('is_staff', False)
        
        # Use create_superuser if is_superuser is True
        if is_superuser:
            user = CustomUser.objects.create_superuser(
                email=validated_data['email'],
                password=validated_data['password']
            )
        else:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password']
            )
            # Set staff status if needed
            if is_staff:
                user.is_staff = True
                user.save()
                
        return user
