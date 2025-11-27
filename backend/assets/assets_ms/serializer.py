from rest_framework import serializers
from assets_ms.services.contexts import *
from .models import *
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

# Product
class ProductSerializer(serializers.ModelSerializer):
    # Include handy context details from the Contexts service for the frontend
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    depreciation_details = serializers.SerializerMethodField()
    default_supplier_details = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
    
    # Check for products with the same name that has is_deleted=False
    # Safe registration for API requests
    # Case sensitive
    # Ignore leading/trailing spaces and multiple internal spaces
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if name:
            # Normalize spacing and apply Title Case for consistent storage and comparisons
            normalized_name = " ".join(name.split()).strip().title()
            data['name'] = normalized_name
        else:
            normalized_name = None

        if normalized_name and Product.objects.filter(
            name__iexact=normalized_name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "A product with this name already exists."
            })
        
        return data

    def get_category_details(self, obj):
        try:
            if not getattr(obj, 'category', None):
                return None
            return get_category_by_id(obj.category)
        except Exception:
            return {"warning": "Contexts service unreachable for categories."}

    def get_manufacturer_details(self, obj):
        try:
            if not getattr(obj, 'manufacturer', None):
                return None
            return get_manufacturer_by_id(obj.manufacturer)
        except Exception:
            return {"warning": "Contexts service unreachable for manufacturers."}

    def get_depreciation_details(self, obj):
        try:
            if not getattr(obj, 'depreciation', None):
                return None
            return get_depreciation_by_id(obj.depreciation)
        except Exception:
            return {"warning": "Contexts service unreachable for depreciations."}
    
    def get_default_supplier_details(self, obj):
        try:
            if not getattr(obj, 'default_supplier', None):
                return None
            return get_supplier_by_id(obj.default_supplier)
        except Exception:
            return {"warning": "Contexts service unreachable for suppliers."}
    
# Asset
class AssetSerializer(serializers.ModelSerializer):
    # Include context details for frontend convenience
    status_details = serializers.SerializerMethodField()
    location_details = serializers.SerializerMethodField()
    supplier_details = serializers.SerializerMethodField()
    ticket = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = '__all__'

    def validate(self, data):
        product = data.get('product')
        name = data.get('name')
        instance = self.instance

        # Check if product is deleted
        if product.is_deleted:
            raise serializers.ValidationError({"product": "Cannot check out a deleted product."})

        if name:
            # Normalize spacing and apply Title Case
            normalized_name = " ".join(name.split()).strip().title()
            data['name'] = normalized_name
        else:
            normalized_name = None

        if normalized_name and Asset.objects.filter(
            name__iexact=normalized_name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "An asset with this name already exists."
            })
        
        return data

    def get_status_details(self, obj):
        """Return status details fetched from Contexts service."""
        try:
            if not getattr(obj, 'status', None):
                return None
            # import here to avoid circular import at module import time
            from assets_ms.services.contexts import get_status_by_id
            return get_status_by_id(obj.status)
        except Exception:
            return {"warning": "Contexts service unreachable for statuses."}

    def get_location_details(self, obj):
        """Return location details fetched from Contexts service."""
        try:
            if not getattr(obj, 'location', None):
                return None
            from assets_ms.services.contexts import get_location_by_id
            return get_location_by_id(obj.location)
        except Exception:
            return {"warning": "Contexts service unreachable for locations."}

    def get_supplier_details(self, obj):
        """Return supplier details fetched from Contexts service."""
        try:
            if not getattr(obj, 'supplier', None):
                return None
            from assets_ms.services.contexts import get_supplier_by_id
            return get_supplier_by_id(obj.supplier)
        except Exception:
            return {"warning": "Contexts service unreachable for suppliers."}

    def get_ticket(self, obj):
        """Return all tickets referencing this asset from Contexts service."""
        try:
            if not obj.id:
                return []
            from assets_ms.services.contexts import get_tickets_by_asset_id
            return get_tickets_by_asset_id(obj.id)
        except Exception:
            return []
 
class AssetCheckoutSerializer(serializers.ModelSerializer):
    checkout_to = serializers.IntegerField(read_only=True)
    location = serializers.IntegerField(read_only=True)
    checkout_date = serializers.DateField(read_only=True)
    return_date = serializers.DateField(read_only=True)
    class Meta:
        model = AssetCheckout
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit the asset dropdown to assets that are not checked out
        self.fields['asset'].queryset = Asset.objects.filter(
            is_deleted=False
        ).exclude(
            id__in=AssetCheckout.objects.filter(asset_checkin__isnull=True).values_list('asset_id', flat=True)
        )
    
    def validate(self, data):
        asset = data.get('asset')
        ticket_id = data.get('ticket_id')

        if not ticket_id:
            raise serializers.ValidationError({"ticket_id": "A ticket is required to check out this asset."})

        ticket = get_ticket_by_id(ticket_id)
        if not ticket or ticket.get("warning"):
            raise serializers.ValidationError({"ticket_id": "Ticket not found."})

        if ticket.get("is_resolved", False):
            raise serializers.ValidationError({"ticket_id": "Ticket is already resolved."})

        if ticket.get("asset") != asset.id:
            raise serializers.ValidationError({
                "ticket_id": "This ticket does not correspond to the selected asset."
            })

        if asset is None:
            raise serializers.ValidationError({"asset": "Asset is required."})

        # Check if asset is deleted
        if asset.is_deleted:
            raise serializers.ValidationError({"asset": "Cannot check out a deleted asset."})

        # Check for existing active checkouts (without select_for_update)
        if AssetCheckout.objects.filter(asset=asset, asset_checkin__isnull=True).exists():
            raise serializers.ValidationError({
                "asset": "This asset is already checked out and not yet checked in."
            })
        
        # Validate return date
        checkout_date = data.get('checkout_date', timezone.now())
        return_date = data.get('return_date')
        if return_date and return_date < checkout_date:
            raise serializers.ValidationError({
                "return_date": "Return date cannot be before checkout date."
            })

        return data
    
    def create(self, validated_data):
        ticket_id = validated_data.get('ticket_id')
        ticket = get_ticket_by_id(ticket_id)
        if not ticket or ticket.get("warning"):
            raise serializers.ValidationError({"ticket_id": "Invalid ticket"})

        # Preserve ticket_id
        validated_data['ticket_id'] = ticket_id

        # Populate fields from ticket
        validated_data['checkout_to'] = ticket.get('employee')
        validated_data['location'] = ticket.get('location')
        validated_data['checkout_date'] = ticket.get('checkout_date')
        validated_data['return_date'] = ticket.get('return_date')

        return super().create(validated_data)
        
class AssetCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckin
        fields = '__all__'

    def validate(self, data):
        checkout = data.get('asset_checkout')
        checkin_date = data.get('checkin_date', timezone.now())
        ticket_id = data.get('ticket_id')

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
        
        # Optional ticket validation
        if ticket_id:
            ticket = get_ticket_by_id(ticket_id)
            if not ticket or ticket.get("warning"):
                raise serializers.ValidationError({"ticket_id": "Ticket not found."})

            if ticket.get("asset") != checkout.asset_id:
                raise serializers.ValidationError({
                    "ticket_id": "Ticket does not match this asset."
                })
            
        return data

# Component
class ComponentSerializer(serializers.ModelSerializer):
    # Include context details for frontend convenience
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    supplier_details = serializers.SerializerMethodField()
    location_details = serializers.SerializerMethodField()

    class Meta:
        model = Component
        fields = '__all__'
    
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if name:
            # Normalize spacing and apply Title Case
            normalized_name = " ".join(name.split()).strip().title()
            data['name'] = normalized_name
        else:
            normalized_name = None

        if normalized_name and Component.objects.filter(
            name__iexact=normalized_name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "A component with this name already exists."
            })
        
        return data

    def get_category_details(self, obj):
        try:
            if not getattr(obj, 'category', None):
                return None
            from assets_ms.services.contexts import get_category_by_id
            return get_category_by_id(obj.category)
        except Exception:
            return {"warning": "Contexts service unreachable for categories."}

    def get_manufacturer_details(self, obj):
        try:
            if not getattr(obj, 'manufacturer', None):
                return None
            from assets_ms.services.contexts import get_manufacturer_by_id
            return get_manufacturer_by_id(obj.manufacturer)
        except Exception:
            return {"warning": "Contexts service unreachable for manufacturers."}

    def get_supplier_details(self, obj):
        try:
            if not getattr(obj, 'supplier', None):
                return None
            from assets_ms.services.contexts import get_supplier_by_id
            return get_supplier_by_id(obj.supplier)
        except Exception:
            return {"warning": "Contexts service unreachable for suppliers."}

    def get_location_details(self, obj):
        try:
            if not getattr(obj, 'location', None):
                return None
            from assets_ms.services.contexts import get_location_by_id
            return get_location_by_id(obj.location)
        except Exception:
            return {"warning": "Contexts service unreachable for locations."}

class ComponentCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCheckout
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Allow checkout only if component still has stock
        available_components = [
            c for c in Component.objects.filter(is_deleted=False)
            if c.available_quantity > 0
        ]
        self.fields['component'].queryset = Component.objects.filter(
            id__in=[c.id for c in available_components]
        )

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

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Fetch checkouts efficiently with related component and asset
        available_checkouts = [
            checkout for checkout in ComponentCheckout.objects.select_related('component', 'asset')
            if not checkout.is_fully_returned
        ]

        # Filter queryset to include only active (not fully returned) checkouts
        self.fields['component_checkout'].queryset = ComponentCheckout.objects.filter(
            id__in=[c.id for c in available_checkouts]
        )

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

class AuditScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditSchedule
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit dropdown to non-deleted assets only
        self.fields['asset'].queryset = Asset.objects.filter(is_deleted=False)

    def validate(self, data):
        asset = data.get('asset')

        # Ensure asset is not deleted
        if asset and asset.is_deleted:
            raise serializers.ValidationError({
                "asset": "Cannot create an audit schedule for a deleted asset."
            })

        return data

class CompletedAuditSerializer(serializers.ModelSerializer):
    audit = serializers.SerializerMethodField()

    class Meta:
        model = AuditSchedule
        fields = '__all__'

    def get_audit(self, obj):
        """Return audit data if it exists"""
        if hasattr(obj, 'audit') and obj.audit and not obj.audit.is_deleted:
            return {
                "id": obj.audit.id,
                "location": obj.audit.location,
                "user_id": obj.audit.user_id,
                "audit_date": obj.audit.audit_date,
                "notes": obj.audit.notes,
                "created_at": obj.audit.created_at
            }
        return None

class AuditFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditFile
        fields = '__all__'
        
class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'
    
    def validate(self, data):
        audit_date = data.get('audit_date')
        audit_schedule = data.get('audit_schedule')

        if audit_schedule and audit_date:
            # Audit date must be on or after schedule date
            if audit_date < audit_schedule.date:
                raise serializers.ValidationError({
                    'audit_date': "Audit date cannot be before the scheduled date."
                })

        return data
    
class RepairSerializer(serializers.ModelSerializer):
    supplier_details = serializers.SerializerMethodField()
    status_details = serializers.SerializerMethodField()

    class Meta:
        model = Repair
        fields = '__all__'

    def get_supplier_details(self, obj):
        """Fetch supplier details from the Contexts service."""
        try:
            if not obj.supplier_id:
                return None
            supplier = get_supplier_by_id(obj.supplier_id)
            return supplier
        except Exception:
            return {
                "warning": "Supplier service unreachable. Make sure 'contexts-service' is running and accessible."
            }

    def get_status_details(self, obj):
        """Fetch status details from the Contexts service."""
        try:
            if not getattr(obj, 'status_id', None):
                return None
            status = get_status_by_id(obj.status_id)
            return status
        except Exception:
            return {
                "warning": "Statuses service unreachable. Make sure 'contexts-service' is running and accessible."
            }

    def validate(self, attrs):
        """Prevent duplicate repairs on the same asset with same name/date."""
        asset = attrs.get('asset') or getattr(self.instance, 'asset', None)
        name = attrs.get('name') or getattr(self.instance, 'name', None)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', timezone.localdate())

        # Ensure date-only (no datetime)
        if isinstance(start_date, timezone.datetime):
            start_date = start_date.date()

        # 🔍 Check for existing repair with same asset, name, and date
        # Normalize the repair name for comparison/storage (Title Case)
        if name:
            normalized_name = " ".join(name.split()).strip().title()
            attrs['name'] = normalized_name
        else:
            normalized_name = None

        duplicate = False
        if normalized_name:
            duplicate = (
                Repair.objects.filter(
                    asset=asset,
                    name__iexact=normalized_name,
                    start_date=start_date,
                    is_deleted=False
                )
                .exclude(pk=self.instance.pk if self.instance else None)
                .exists()
            )

        if duplicate:
            raise serializers.ValidationError({
                "non_field_errors": [
                    "A repair record with the same asset, name, and start date already exists."
                ]
            })

        attrs['start_date'] = start_date
        return attrs

    def create(self, validated_data):
        start_date = validated_data.get('start_date', timezone.localdate())
        if isinstance(start_date, timezone.datetime):
            start_date = start_date.date()
        validated_data['start_date'] = start_date
        return super().create(validated_data)
    
class RepairFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairFile
        fields = '__all__'
        
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