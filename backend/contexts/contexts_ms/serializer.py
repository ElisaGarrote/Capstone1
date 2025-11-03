from rest_framework import serializers
from .models import *
from .utils import normalize_name_smart

class CategorySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
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

        qs = Category.objects.filter(name__iexact=normalized_name, type=type_val, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({'name': 'A category with this name and type already exists.'})

        return attrs

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

        qs = Supplier.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
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

        qs = Depreciation.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
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

        qs = Manufacturer.objects.filter(name__iexact=normalized_name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({'name': 'A Manufacturer with this name already exists.'})

        return attrs


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
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

        qs = Status.objects.filter(name__iexact=normalized_name, type=type_val, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({'name': 'A Status with this name and type already exists.'})

        return attrs


class TicketResolveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['is_resolved']