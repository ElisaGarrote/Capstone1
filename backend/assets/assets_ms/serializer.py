from rest_framework import serializers
from .models import *
from django.db.models import Sum

class ManufacturerNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ['id', 'name']
        
class AllProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    depreciation = serializers.CharField(source='depreciation.name', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'image', 'name', 'category', 'manufacturer_id', 'depreciation', 'end_of_life']

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
    
class ProductDefaultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'default_purchase_cost', 'default_supplier_id']

class ProductSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Product
        fields = '__all__'

class ProductRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class AllAssetSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    product = serializers.CharField(source='product.name', read_only=True)
    status = serializers.CharField(source='status.name', read_only=True)
    
    class Meta:
        model = Asset
        fields = ['id', 'image', 'displayed_id', 'name', 'category', 'status', 'product']
    
    def get_category(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return None
    
class StatusNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'name', 'type']

class AssetSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    status_info = StatusNameSerializer(source='status', read_only=True)
    product_info = ProductNameSerializer(source='product', read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
    
    def get_category(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return None

class AssetRegistrationSerializer(serializers.ModelSerializer):
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

class AllComponentSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    checked_out = serializers.SerializerMethodField()
    class Meta:
        model = Component
        fields = ['id', 'image', 'name', 'category', 'quantity', 'checked_out']

    def get_checked_out(self, obj):
        total_checked_out = obj.components_checkouts.filter(
            component_checkins__isnull=True
        ).aggregate(total=Sum('quantity'))['total'] or 0
        return total_checked_out

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = "__all__"

class ComponentCategoryNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCategory
        fields = ['id', 'name']


class ComponentCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCheckout
        fields = "__all__"

class AssetNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'displayed_id', 'name']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = "__all__"

class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = "__all__"

class DepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = "__all__"
class AssetCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckout
        fields = "__all__"

class AssetCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckin
        fields = "__all__"

class RepairSerializer(serializers.ModelSerializer):
    repair_files = serializers.SerializerMethodField()

    class Meta:
        model = Repair
        fields = "__all__"
    
    def get_repair_files(self, obj):
        # Retrieve all files that are not deleted and the repair matches the current repair instance.
        files = obj.files.filter(is_deleted=False, repair=obj.id)
        return RepairFileSerializer(files, many=True).data

class RepairFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairFile
        fields = "__all__"