from rest_framework import serializers
from .models import *

# Serializer for Accessory and its category
class AllAccessorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Accessory
        fields = ['id', 'image', 'name', 'quantity', 'category_name','location']

# Serializer for Category of Accessory
class AccessoryCategoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessoryCategory
        fields = ['id', 'name']

class AccessorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=AccessoryCategory.objects.all(), required=False, allow_null=True
    )
    class Meta:
        model = Accessory
        fields = '__all__'