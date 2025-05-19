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

class RepairFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairFile
        fields = ['id', 'file']

class RepairSerializer(serializers.ModelSerializer):
    files = RepairFileSerializer(many=True, read_only=True)
    asset_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Repair
        fields = '__all__'
    
    def get_asset_name(self, obj):
        return obj.asset.displayed_id if obj.asset else None

class RepairListSerializer(serializers.ModelSerializer):
    asset_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Repair
        fields = ['id', 'name', 'asset_name', 'type', 'start_date', 'end_date', 'cost']
    
    def get_asset_name(self, obj):
        return obj.asset.displayed_id if obj.asset else None
