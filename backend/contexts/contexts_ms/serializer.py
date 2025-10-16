from rest_framework import serializers
from .models import *

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