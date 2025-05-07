from rest_framework import serializers
from .models import *

class AllProductSerializer(serializers.ModelSerializer):
    first_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'first_image', '']

    def get_first_image(self, obj):
        # gets the first not deleted image
        first_image = obj.images.filter(is_deleted=False).first()  
        if first_image:
            return first_image.image.url 
        return None


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_deleted']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class AuditScheduleSerializer(serializers.ModelSerializer):
    asset_info = AssetSerializer(source='asset', read_only=True)

    class Meta:
        model = AuditSchedule
        fields = '__all__'

class AuditSerializer(serializers.ModelSerializer):
    audit_files = serializers.SerializerMethodField()
    audit_schedule_info = AuditScheduleSerializer(source='audit_schedule', read_only=True)

    class Meta:
        model = Audit
        fields = '__all__'

    def get_audit_files(self, obj):
        # Retrieve all files that are not deleted and the audit matches the current audit instance.
        files = obj.files.filter(is_deleted=False, audit=obj.id)
        return AuditFileSerializer(files, many=True).data

class AuditFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditFile
        fields = "__all__"