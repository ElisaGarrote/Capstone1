from rest_framework import serializers
from .models import *
'''
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
'''

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