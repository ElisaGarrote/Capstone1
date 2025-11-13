from rest_framework import serializers
from .models import *
from .utils import normalize_name_smart
import logging
from .services.assets import *

class CategorySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    asset_count = serializers.SerializerMethodField(read_only=True)
    component_count = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Category
        fields = '__all__'

    def validate(self, attrs):
        # Normalize name and enforce unique (name,type) among non-deleted categories
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        type_val = attrs.get('type') if 'type' in attrs else (self.instance.type if self.instance else None)
        if not name or not type_val:
            return attrs

        # Normalize using smart title-casing (preserves acronyms like "SSD's")
        normalized_name = normalize_name_smart(name)
        attrs['name'] = normalized_name

        seen = None
        try:
            seen = self.context.get('import_seen_names') if isinstance(self.context, dict) else None
        except Exception:
            seen = None

        qs = Category.objects.filter(name__iexact=normalized_name, type=type_val, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            if seen and normalized_name in seen:
                return attrs
            raise serializers.ValidationError({'name': 'A category with this name and type already exists.'})

        return attrs

    def get_asset_count(self, obj):
        """Return number of assets referencing this category, or None if unknown."""
        # Prefer batched counts supplied by the view via serializer context
        try:
            if getattr(obj, 'type', None) != 'asset':
                return None
            usage_map = self.context.get('category_usage') if isinstance(self.context, dict) else None
            if isinstance(usage_map, dict) and obj.id in usage_map:
                val = usage_map.get(obj.id)
                # asset_count expected in the assets service response
                return val.get('asset_count') if isinstance(val, dict) else None
            # Fallback to per-item call
            return count_assets_by_category(obj.id)
        except Exception:
            return None

    def get_component_count(self, obj):
        """Return number of components referencing this category, or None if unknown."""
        try:
            if getattr(obj, 'type', None) != 'component':
                return None
            usage_map = self.context.get('category_usage') if isinstance(self.context, dict) else None
            if isinstance(usage_map, dict) and obj.id in usage_map:
                val = usage_map.get(obj.id)
                # component_ids is an array in the assets response
                if isinstance(val, dict) and 'component_ids' in val:
                    return len(val.get('component_ids') or [])
                return None
            return count_components_by_category(obj.id)
        except Exception:
            return None

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

    def validate(self, attrs):
        # For create: instance not present; for update: instance available at self.instance
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        if not name:
            return attrs
        normalized_name = normalize_name_smart(name)
        attrs['name'] = normalized_name

        # Allow import-time bypass when the import flow provides a set of names
        # already created/updated in this run (to avoid false-positive conflicts
        # when a single sheet contains related rows). The import handler sets
        # `context['import_seen_names']` to a set of normalized names.
        seen = None
        try:
            seen = self.context.get('import_seen_names') if isinstance(self.context, dict) else None
        except Exception:
            seen = None

        qs = Supplier.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            # If the name is already in the seen set for this import run, allow it
            # to proceed (it was created earlier in this same upload).
            if seen and normalized_name in seen:
                return attrs
            # Debug log existing supplier names when a duplicate is detected
            try:
                existing = list(Supplier.objects.filter(is_deleted=False).values_list('name', flat=True))
                logging.getLogger('import_export').debug('supplier duplicate check failed for %s existing=%s', normalized_name, existing)
            except Exception:
                pass
            raise serializers.ValidationError({'name': 'A Supplier with this name already exists.'})

        return attrs


class ManufacturerNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ['id', 'name']


class DepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        if not name:
            return attrs
        normalized_name = normalize_name_smart(name)
        attrs['name'] = normalized_name

        seen = None
        try:
            seen = self.context.get('import_seen_names') if isinstance(self.context, dict) else None
        except Exception:
            seen = None

        qs = Depreciation.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            if seen and normalized_name in seen:
                return attrs
            raise serializers.ValidationError({'name': 'A Depreciation with this name already exists.'})

        return attrs


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        if not name:
            return attrs
        normalized_name = normalize_name_smart(name)
        attrs['name'] = normalized_name

        seen = None
        try:
            seen = self.context.get('import_seen_names') if isinstance(self.context, dict) else None
        except Exception:
            seen = None

        qs = Manufacturer.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            if seen and normalized_name in seen:
                return attrs
            raise serializers.ValidationError({'name': 'A Manufacturer with this name already exists.'})

        return attrs


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    asset_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Status
        fields = '__all__'

    def validate(self, attrs):
        # Enforce uniqueness of name+type among non-deleted statuses.
        # Allow re-using a name if the existing record is soft-deleted.
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        type_val = attrs.get('type') if 'type' in attrs else (self.instance.type if self.instance else None)
        if not name or not type_val:
            return attrs

        normalized_name = normalize_name_smart(name)
        attrs['name'] = normalized_name

        seen = None
        try:
            seen = self.context.get('import_seen_names') if isinstance(self.context, dict) else None
        except Exception:
            seen = None

        qs = Status.objects.filter(name__iexact=normalized_name, type=type_val, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            if seen and normalized_name in seen:
                return attrs
            raise serializers.ValidationError({'name': 'A Status with this name and type already exists.'})

        return attrs

    def get_asset_count(self, obj):
        """Return number of assets referencing this status id, preferring batched mapping from view context."""
        try:
            usage_map = self.context.get('status_usage') if isinstance(self.context, dict) else None
            if isinstance(usage_map, dict) and obj.id in usage_map:
                val = usage_map.get(obj.id)
                return val.get('asset_count') if isinstance(val, dict) else None
            return None
        except Exception:
            return None


class TicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = '__all__'
    
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    def validate(self, data):
        ticket_type = data.get("ticket_type") or (self.instance and self.instance.ticket_type)

        if ticket_type == Ticket.TicketType.CHECKOUT:
            if not self.partial:  # only enforce on creation
                if not data.get("checkout_date"):
                    raise serializers.ValidationError({"checkout_date": "This field is required for checkout ticket."})
                if not data.get("return_date"):
                    raise serializers.ValidationError({"return_date": "This field is required for checkout ticket."})

            # Disallow checkin-only fields even on partial update
            if data.get("asset_checkout"):
                raise serializers.ValidationError({"asset_checkout": "Not allowed for checkout ticket."})
            if data.get("checkin_date"):
                raise serializers.ValidationError({"checkin_date": "Not allowed for checkout ticket."})

        elif ticket_type == Ticket.TicketType.CHECKIN:
            if not self.partial:  # only enforce on creation
                if not data.get("asset_checkout"):
                    raise serializers.ValidationError({"asset_checkout": "This field is required for checkin ticket."})
                if not data.get("checkin_date"):
                    raise serializers.ValidationError({"checkin_date": "This field is required for checkin ticket."})

            # Disallow checkout-only fields even on partial update
            if data.get("checkout_date"):
                raise serializers.ValidationError({"checkout_date": "Not allowed for checkin ticket."})
            if data.get("return_date"):
                raise serializers.ValidationError({"return_date": "Not allowed for checkin ticket."})

        return data
