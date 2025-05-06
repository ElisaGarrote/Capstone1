from rest_framework import serializers
from .models import *

class AllProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'image', 'name', 'model_number', 'category_name', 'manufacturer_name', 'end_of_life']
        
class ProductDepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    depreciation = serializers.PrimaryKeyRelatedField(
        queryset=Depreciation.objects.all(), required=False, allow_null=True
    )
    class Meta:
        model = Product
        fields = '__all__'

class DepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = '__all__'
