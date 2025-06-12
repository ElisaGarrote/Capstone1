from rest_framework import serializers
from .models import *

class ConsumableCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumableCategory
        fields = '__all__'