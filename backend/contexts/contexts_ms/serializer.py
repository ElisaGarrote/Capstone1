from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    class Meta:
        model = Category
        fields = '__all__'
    
    # Check for categories with the same name and type that has is_deleted=False
    # Safe registration for API requests
    def validate(self, data):
        name = data.get('name')
        type_ = data.get('type')
        instance = self.instance

        if Category.objects.filter(
            name__exact=name,
            type=type_,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "A category with this name and type already exists."
            })
        return data

    def update(self, instance, validated_data):
        # Handle remove_logo flag
        if self.context['request'].data.get('remove_logo'):
            if instance.logo:
                instance.logo.delete(save=False)
            instance.logo = None

        # Handle new logo upload
        if validated_data.get('logo'):
            instance.logo = validated_data.get('logo')

        # Update other fields
        instance.name = validated_data.get('name', instance.name)
        instance.type = validated_data.get('type', instance.type)
        instance.save()
        return instance

class SupplierNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name']

class ManufacturerNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ['id', 'name']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class TicketResolveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
    fields = ['is_resolved']