from rest_framework import serializers
from .models import *
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce

# Product or Asset Model
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
    
    # Check for products with the same name that has is_deleted=False
    # Safe registration for API requests
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if Product.objects.filter(
            name__exact=name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "A product with this name already exists."
            })
        return data

# Asset
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'
    
    # Check for assets with the same name that has is_deleted=False
    # Safe registration for API requests
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        # Convert empty string to None
        if name == "":
            data['name'] = None

        # Check for duplicate name
        if Asset.objects.filter(
            name__exact=name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "An asset with this name already exists."
            })
        return data

from django.db import transaction

class AssetCheckoutSerializer(serializers.ModelSerializer):
    return_date = serializers.DateTimeField(input_formats=['%m/%d/%Y %I:%M %p', 'iso-8601'])

    class Meta:
        model = AssetCheckout
        fields = '__all__'

    def validate(self, data):
        asset = data.get('asset')

        if asset is None:
            raise serializers.ValidationError({"asset": "Asset is required."})

        # Check if asset is deleted
        if asset.is_deleted:
            raise serializers.ValidationError({"asset": "Cannot check out a deleted asset."})

        # Prevent multiple active checkouts using select_for_update for concurrency safety
        with transaction.atomic():
            if AssetCheckout.objects.select_for_update().filter(asset=asset, asset_checkin__isnull=True).exists():
                raise serializers.ValidationError({
                    "asset": "This asset is already checked out and not yet checked in."
                })

        # Return date validation
        checkout_date = data.get('checkout_date', timezone.now())
        return_date = data.get('return_date')
        if return_date and return_date < checkout_date:
            raise serializers.ValidationError({
                "return_date": "Return date cannot be before checkout date."
            })

        return data

class AssetCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckin
        fields = '__all__'

    def validate(self, data):
        checkout = data.get('asset_checkout')
        checkin_date = data.get('checkin_date', timezone.now())

        # Check if checkout exists
        if not checkout:
            raise serializers.ValidationError({"asset_checkout": "Checkout record is required."})

        # Prevent multiple checkins
        if checkout and AssetCheckin.objects.filter(asset_checkout=checkout).exists():
            raise serializers.ValidationError({
                "asset_checkout": "This asset has already been checked in."
            })
        
        # Make sure checkin happens after checkout
        if checkin_date < checkout.checkout_date:
            raise serializers.ValidationError({
                "checkin_date": "Cannot check in before checkout date."
            })

        return data

# Component
class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'
    
    # Check for components with the same name that has is_deleted=False
    # Safe registration for API requests
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if Component.objects.filter(
            name__exact=name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "A component with this name already exists."
            })
        return data

class ComponentCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCheckout
        fields = '__all__'

    def validate(self, data):
        component = data.get('component')
        quantity = data.get('quantity')

        # Check if component is deleted
        if component and component.is_deleted:
            raise serializers.ValidationError({
                "component": "Cannot check out a deleted component."
            })
        
        # Quantity validation
        if quantity <= 0:
            raise serializers.ValidationError({
                "quantity": "Quantity must be greater than zero."
            })

        # Check stock availability using the model property
        if quantity > component.available_quantity:
            raise serializers.ValidationError({
                "quantity": f"Not enough quantity available for {component.name}. "
                            f"Only {component.available_quantity} left in stock."
            })

        return data

class ComponentCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCheckin
        fields = '__all__'

    def validate(self, data):
        checkout = data.get('component_checkout')
        quantity = data.get('quantity')
        checkin_date = data.get('checkin_date', timezone.now())

        # Check if checkout exists
        if not checkout:
            raise serializers.ValidationError({"component_checkout": "Checkout record is required."})
        
        # Quantity validation
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be greater than zero."})
        
        # Cannot check in more than remaining quantity
        if checkout and quantity > checkout.remaining_quantity:
            raise serializers.ValidationError({
                "quantity": f"Cannot check in more than remaining quantity "
                            f"({checkout.remaining_quantity})."
            })
        
        # Cannot check in before checkout date
        if checkin_date < checkout.checkout_date:
            raise serializers.ValidationError({
                "checkin_date": "Cannot check in before the checkout date."
            })

        return data




class AllProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    depreciation = serializers.CharField(source='depreciation.name', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'image', 'name', 'category', 'manufacturer_id', 'depreciation', 'end_of_life']


class ProductNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name']
    
class ProductDefaultsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'default_purchase_cost', 'default_supplier_id']

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
        fields = ['id', 'image', 'displayed_id', 'name', 'category', 'status', 'product', 'supplier_id']
    
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

class ComponentCheckoutSerializer(serializers.ModelSerializer):
    asset_displayed_id = serializers.CharField(source='to_asset.displayed_id', read_only=True)
    asset_name = serializers.CharField(source='to_asset.name', read_only=True)
    class Meta:
        model = ComponentCheckout
        fields = "__all__"
        extra_fields = ['asset_name', 'asset_displayed_id']

class ComponentCheckinSerializer(serializers.ModelSerializer):

    class Meta:
        model = ComponentCheckin
        fields = "__all__"
        
class AssetNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'displayed_id', 'name']

class AssetCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckout
        fields = "__all__"

class AssetCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckin
        fields = "__all__"

class RepairSerializer(serializers.ModelSerializer):
    asset_info = AllAssetSerializer(source='asset', read_only=True)
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

class DashboardStatsSerializer(serializers.Serializer):
    due_for_return = serializers.IntegerField()
    overdue_for_return = serializers.IntegerField()
    upcoming_audits = serializers.IntegerField()
    overdue_audits = serializers.IntegerField()
    reached_end_of_life = serializers.IntegerField()
    upcoming_end_of_life = serializers.IntegerField()
    expired_warranties = serializers.IntegerField()
    expiring_warranties = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    total_asset_costs = serializers.DecimalField(max_digits=12, decimal_places=2)
    asset_utilization = serializers.IntegerField()
    asset_categories = serializers.ListField(child=serializers.DictField())
    asset_statuses = serializers.ListField(child=serializers.DictField())
