from rest_framework import serializers
from .models import *
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

# Product
class ProductSerializer(serializers.ModelSerializer):
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
            normalized_name = " ".join(name.split()).strip()
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
    
# Asset
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if name:
            normalized_name = " ".join(name.split()).strip()
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
 
class AssetCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckout
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit the asset dropdown to assets that are not checked out
        self.fields['asset'].queryset = Asset.objects.filter(
            is_deleted=False
        ).exclude(
            asset_checkouts__asset_checkin__isnull=True
        )

    def validate(self, data):
        asset = data.get('asset')

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
    
class AssetCheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckin
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit choices to only checkouts that don't yet have a checkin
        self.fields['asset_checkout'].queryset = AssetCheckout.objects.filter(
            asset_checkin__isnull=True
        )

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
    
    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if name:
            normalized_name = " ".join(name.split()).strip()
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

class ComponentCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentCheckout
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit the component dropdown to components that are not checked out
        self.fields['component'].queryset = Component.objects.filter(
            is_deleted=False
        ).exclude(
            compoponent_checkouts__component_checkins__isnull=True
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