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

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class AuditScheduleSerializer(serializers.ModelSerializer):
    asset_info = AssetSerializer(source='asset', read_only=True)

    class Meta:
        model = AuditSchedule
        fields = '__all__'

class AuditSerializer(serializers.ModelSerializer):
    audit_files = serializers.SerializerMethodField()
    audit_schedule_info = AuditScheduleSerializer(source='audit_schedule', read_only=True)

    class Meta:
        model = Audit
        fields = '__all__'

    def get_audit_files(self, obj):
        # Retrieve all files that are not deleted and the audit matches the current audit instance.
        files = obj.files.filter(is_deleted=False, audit=obj.id)
        return AuditFileSerializer(files, many=True).data

class AuditFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditFile
        fields = "__all__"