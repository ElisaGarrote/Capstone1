from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

    def validate(self, attrs):
        # For create: instance not present; for update: instance available at self.instance
        name = attrs.get('name') if 'name' in attrs else (self.instance.name if self.instance else None)
        if not name:
            return attrs

        qs = Supplier.objects.filter(name__iexact=name, is_deleted=False)
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

        qs = Depreciation.objects.filter(name__iexact=name, is_deleted=False)
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

        qs = Manufacturer.objects.filter(name__iexact=name, is_deleted=False)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({'name': 'A Manufacturer with this name already exists.'})

        return attrs


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class TicketResolveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['is_resolved']