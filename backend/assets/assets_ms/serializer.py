from rest_framework import serializers
from .models import *

class AllProductSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'first_image', 'name', 'model_number', 'category_name', 'manufacturer_name', 'end_of_life']

    def get_first_image(self, obj):
        # gets the first not deleted image
        first_image = obj.images.filter(is_deleted=False).first()  
        if first_image and first_image.image:
            return first_image.image.url 
        return None

class ProductDepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = ['id', 'name']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    depreciation = ProductDepreciationSerializer(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class DepreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depreciation
        fields = '__all__'
