from rest_framework import serializers
from .models import *

class AllAccessorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accessory
        fields = ['id', 'image', 'name', 'quantity', 'model_number', 'location']