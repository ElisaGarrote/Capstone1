from rest_framework import serializers
from .models import *

class AllAccessorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accessory
        fields = ['id', 'image', 'name', 'quantity', 'model_number', 'location']

class AccessoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_deleted']

class AccessorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    class Meta:
        model = Accessory
        fields = '__all__'