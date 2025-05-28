from rest_framework import serializers
from .models import *

# Serializer for Accessory and its category
class AllAccessorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Accessory
        fields = ['id', 'image', 'name', 'quantity', 'category_name','location']

#Serializer for Accessory Category Name
class AccessoryCategoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessoryCategory
        fields = ['id', 'name']

# Serializer for Category of Accessory
class AccessoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessoryCategory
        fields = '__all__'

class AccessorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=AccessoryCategory.objects.all(), required=False, allow_null=True
    )
    class Meta:
        model = Accessory
        fields = '__all__'

class AccessoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accessory
        fields = ['id', 'name']
