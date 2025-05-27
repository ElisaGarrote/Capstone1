from rest_framework import serializers
from .models import *

class AllProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    depreciation = serializers.CharField(source='depreciation.name', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'image', 'name', 'category', 'manufacturer_id', 'depreciation']

class AssetCategoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = ['id', 'name']

class DepreciationNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = ['id', 'name']

class ProductNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=AssetCategory.objects.all(), required=True, allow_null=False
    )
    depreciation = serializers.PrimaryKeyRelatedField(
        queryset=Depreciation.objects.all(), required=True, allow_null=False
    )
    class Meta:
        model = Product
        fields = '__all__'

class AllAssetSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)
    
    class Meta:
        model = Asset
        fields = ['id', 'image', 'displayed_id', 'name', 'category', 'status']
    
    def get_category(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return None
    
class StatusNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'name']

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class AuditScheduleSerializer(serializers.ModelSerializer):
    asset_info = AssetSerializer(source='asset', read_only=True)
    audit_info = serializers.SerializerMethodField()

    class Meta:
        model = AuditSchedule
        fields = '__all__'
    
    def get_audit_info(self, obj):
        # Retrieve all audits that are not deleted and the audit schedule matches the current audit schedule instance.
        try:
            audit = obj.asset_audits.get(is_deleted=False, audit_schedule=obj.id)
            return AuditSerializer(audit).data
        except Audit.DoesNotExist:
            return None

class AuditScheduleOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditSchedule
        fields = '__all__'

class AuditSerializer(serializers.ModelSerializer):
    audit_files = serializers.SerializerMethodField()
    asset_info = AssetSerializer(source='audit_schedule.asset', read_only=True)
    audit_schedule_info = AuditScheduleOnlySerializer(source='audit_schedule', read_only=True)

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

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = "__all__"

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = "__all__"
