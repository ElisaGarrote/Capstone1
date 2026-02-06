from rest_framework import serializers
from assets_ms.services.contexts import *
from assets_ms.services.integration_help_desk import *
from assets_ms.services.integration_ticket_tracking import *
from .models import *
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import datetime

# Product

# Serializer for product list view
class ProductListSerializer(serializers.ModelSerializer):
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    depreciation_details = serializers.SerializerMethodField()
    default_supplier_details = serializers.SerializerMethodField()
    has_assets = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'image', 'name', 'category_details', 'model_number', 'end_of_life',
            'manufacturer_details', 'depreciation_details', 'default_purchase_cost',
            'default_supplier_details', 'minimum_quantity', 'has_assets'
        ]

    def get_has_assets(self, obj):
        return obj.product_assets.filter(is_deleted=False).exists()

    def get_category_details(self, obj):
        return self.context.get("category_map", {}).get(obj.category)

    def get_manufacturer_details(self, obj):
        return self.context.get("manufacturer_map", {}).get(obj.manufacturer)

    def get_depreciation_details(self, obj):
        return self.context.get("depreciation_map", {}).get(obj.depreciation)

    def get_default_supplier_details(self, obj):
        return self.context.get("supplier_map", {}).get(obj.default_supplier)

# Serializer for product create, update, and destroy
class ProductSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

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
            # Normalize spacing and apply Title Case for consistent storage and comparisons
            normalized_name = " ".join(name.split()).strip().title()
            # Keep "(clone)" lowercase
            normalized_name = normalized_name.replace("(Clone)", "(clone)")
            data['name'] = normalized_name
        else:
            normalized_name = None

        if normalized_name and Product.objects.filter(
            name__iexact=normalized_name,
            is_deleted=False
        ).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError({
                "name": "An asset model with this name already exists."
            })

        return data

# Serializer for product instance retrieve
class ProductInstanceSerializer(serializers.ModelSerializer):
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    depreciation_details = serializers.SerializerMethodField()
    default_supplier_details = serializers.SerializerMethodField()
    assets = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_has_assets(self, obj):
        return obj.product_assets.filter(is_deleted=False).exists()

    def get_category_details(self, obj):
        return self.context.get("category_map", {}).get(obj.category)

    def get_manufacturer_details(self, obj):
        return self.context.get("manufacturer_map", {}).get(obj.manufacturer)

    def get_depreciation_details(self, obj):
        return self.context.get("depreciation_map", {}).get(obj.depreciation)

    def get_default_supplier_details(self, obj):
        return self.context.get("supplier_map", {}).get(obj.default_supplier)

    def get_assets(self, obj):
        assets = obj.product_assets.filter(is_deleted=False).order_by('name')

        # Reuse full list serializer
        serializer = AssetListSerializer(
            assets,
            many=True,
            context=self.context   # pass context so ticket/status mappings work
        )
        return serializer.data
# Serializer for filling data in asset registration that is default in product
class ProductAssetRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'default_purchase_cost', 'default_supplier']

# Serializer for product bulk edit selected items
class ProductNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'image' , 'name', 'end_of_life']

# Asset
class AssetListSerializer(serializers.ModelSerializer):
    status_details = serializers.SerializerMethodField()
    product_details = serializers.SerializerMethodField()
    ticket_details = serializers.SerializerMethodField()
    active_checkout = serializers.SerializerMethodField()
    class Meta:
        model = Asset
        fields = [
            'id', 'image', 'asset_id', 'name', 'serial_number',
            'status_details', 'warranty_expiration',
            'product_details', 'ticket_details', 'active_checkout'
        ]

    def get_status_details(self, obj):
        return self.context.get("status_map", {}).get(obj.status)

    def get_product_details(self, obj):
        return self.context.get("product_map", {}).get(obj.product_id)
    
    def get_ticket_details(self, obj):
        # ticket_map is keyed by display asset_id (e.g., "AST-20260110-00030-43A7")
        return self.context.get("ticket_map", {}).get(obj.asset_id)

    def get_active_checkout(self, obj):
        checkout = obj.asset_checkouts.filter(asset_checkin__isnull=True).first()
        return checkout.id if checkout else None
    
class AssetSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    # Make serial_number and purchase_cost required
    serial_number = serializers.CharField(max_length=50, required=True)
    purchase_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)

    class Meta:
        model = Asset
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make asset_id read-only on update (editable only on create)
        if self.instance:
            self.fields['asset_id'].read_only = True

    def validate(self, data):
        product = data.get('product')
        name = data.get('name')
        status_id = data.get('status')
        instance = self.instance

        # Check if product is deleted
        if product and product.is_deleted:
            raise serializers.ValidationError({"product": "Cannot check out a deleted product."})

        # Validate status category - must be 'asset' category
        if status_id:
            status_details = get_status_by_id(status_id)
            if not status_details or status_details.get("warning"):
                raise serializers.ValidationError({"status": "Status not found."})

            status_category = status_details.get("category")
            if status_category != "asset":
                raise serializers.ValidationError({
                    "status": "Invalid status. Only asset statuses are allowed for assets."
                })

        if name:
            # Normalize spacing and apply Title Case
            normalized_name = " ".join(name.split()).strip().title()
            # Keep "(clone)" lowercase
            normalized_name = normalized_name.replace("(Clone)", "(clone)")
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

class AssetInstanceSerializer(serializers.ModelSerializer):
    product_details = serializers.SerializerMethodField()
    supplier_details = serializers.SerializerMethodField()
    location_details = serializers.SerializerMethodField()
    status_details = serializers.SerializerMethodField()
    ticket_details = serializers.SerializerMethodField()
    active_checkout = serializers.SerializerMethodField()
    checkout_logs = serializers.SerializerMethodField()
    repairs = serializers.SerializerMethodField()
    audits = serializers.SerializerMethodField()
    components = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'asset_id', 'name', 'serial_number', 'warranty_expiration',
            'order_number', 'purchase_date', 'purchase_cost', 'notes',
            'image', 'created_at', 'updated_at', 'location',
            'product_details', 'status_details', 'supplier_details', 'location_details',
            'ticket_details', 'active_checkout',
            'checkout_logs', 'repairs', 'audits', 'components', 'files'
        ]

    def get_status_details(self, obj):
        status = self.context.get("status_map", {}).get(obj.status)
        if not status:
            return None
        return {
            'id': status.get('id'),
            'name': status.get('name'),
            'type': status.get('type') or status.get('code') or status.get('slug')
        }

    def get_supplier_details(self, obj):
        """Return supplier details (id, name) from context service."""
        if not obj.supplier:
            return None
        supplier = get_supplier_by_id(obj.supplier)
        if not supplier or supplier.get('warning'):
            return None
        return {
            'id': supplier.get('id'),
            'name': supplier.get('name') or supplier.get('display_name')
        }

    def get_location_details(self, obj):
        """Return location details (id, name) from context map or help desk service."""
        if not obj.location:
            return None
        # First try to get from context map (faster, already fetched)
        location_map = self.context.get("location_map", {})
        if location_map and obj.location in location_map:
            loc = location_map[obj.location]
            return {
                'id': loc.get('id'),
                'name': loc.get('display_name') or loc.get('city') or loc.get('name')
            }
        # Fallback to direct API call
        location = get_location_by_id(obj.location)
        if not location or location.get('warning'):
            return None
        return {
            'id': location.get('id'),
            'name': location.get('display_name') or location.get('city') or location.get('name')
        }

    def get_product_details(self, obj):
        """Return product details with nested category, manufacturer, depreciation details."""
        if not obj.product:
            return None

        product = obj.product

        # Fetch related details
        category_data = get_category_by_id(product.category) if product.category else None
        manufacturer_data = get_manufacturer_by_id(product.manufacturer) if product.manufacturer else None
        depreciation_data = get_depreciation_by_id(product.depreciation) if product.depreciation else None

        # Build category_details (id, name)
        category_details = None
        if category_data and not category_data.get('warning'):
            category_details = {
                'id': category_data.get('id'),
                'name': category_data.get('name')
            }

        # Build manufacturer_details (id, name, website_url, support_phone, support_email)
        manufacturer_details = None
        if manufacturer_data and not manufacturer_data.get('warning'):
            manufacturer_details = {
                'id': manufacturer_data.get('id'),
                'name': manufacturer_data.get('name'),
                'website_url': manufacturer_data.get('website_url') or manufacturer_data.get('url'),
                'support_phone': manufacturer_data.get('support_phone') or manufacturer_data.get('phone'),
                'support_email': manufacturer_data.get('support_email') or manufacturer_data.get('email')
            }

        # Build depreciation_details (id, name, duration_left)
        depreciation_details = None
        if depreciation_data and not depreciation_data.get('warning'):
            # Calculate duration_left (same as depreciation report)
            from datetime import date

            duration = depreciation_data.get('duration') or depreciation_data.get('months') or depreciation_data.get('duration_months') or 36
            try:
                duration = int(duration)
            except (ValueError, TypeError):
                duration = 36

            def months_between(start_date, end_date):
                if not start_date:
                    return 0
                y1, m1, d1 = start_date.year, start_date.month, start_date.day
                y2, m2, d2 = end_date.year, end_date.month, end_date.day
                months = (y2 - y1) * 12 + (m2 - m1)
                if d2 < d1:
                    months -= 1
                return max(months, 0)

            today = date.today()
            months_elapsed = months_between(obj.purchase_date, today)
            duration_left = max(duration - months_elapsed, 0)

            depreciation_details = {
                'id': depreciation_data.get('id'),
                'name': depreciation_data.get('name'),
                'duration_left': duration_left
            }

        return {
            'id': product.id,
            'name': product.name,
            'category_details': category_details,
            'manufacturer_details': manufacturer_details,
            'depreciation_details': depreciation_details,
            'end_of_life': product.end_of_life,
            'cpu': product.cpu,
            'gpu': product.gpu,
            'os': product.os,
            'ram': product.ram,
            'size': product.size,
            'storage': product.storage
        }

    def get_files(self, obj):
        """Return all files from checkouts, checkins, repairs, and audits for this asset."""
        request = self.context.get('request')
        all_files = []

        def build_file_url(file_field):
            if not file_field:
                return None
            return request.build_absolute_uri(file_field.url) if request else file_field.url

        # Files from asset checkouts
        for checkout in obj.asset_checkouts.all():
            for file_obj in checkout.files.filter(is_deleted=False):
                all_files.append({
                    'id': file_obj.id,
                    'file': build_file_url(file_obj.file),
                    'source': 'checkout',
                    'source_id': checkout.id,
                    'created_at': file_obj.created_at
                })

            # Files from asset checkins (if exists)
            if hasattr(checkout, 'asset_checkin') and checkout.asset_checkin:
                for file_obj in checkout.asset_checkin.files.filter(is_deleted=False):
                    all_files.append({
                        'id': file_obj.id,
                        'file': build_file_url(file_obj.file),
                        'source': 'checkin',
                        'source_id': checkout.asset_checkin.id,
                        'created_at': file_obj.created_at
                    })

        # Files from repairs
        for repair in obj.repair_assets.filter(is_deleted=False):
            for file_obj in repair.files.filter(is_deleted=False):
                all_files.append({
                    'id': file_obj.id,
                    'file': build_file_url(file_obj.file),
                    'source': 'repair',
                    'source_id': repair.id,
                    'created_at': file_obj.created_at
                })

        # Files from audits (via audit_schedules -> audit -> audit_files)
        for schedule in obj.audit_schedules.filter(is_deleted=False):
            if hasattr(schedule, 'audit') and schedule.audit and not schedule.audit.is_deleted:
                for file_obj in schedule.audit.audit_files.filter(is_deleted=False):
                    all_files.append({
                        'id': file_obj.id,
                        'file': build_file_url(file_obj.file),
                        'source': 'audit',
                        'source_id': schedule.audit.id,
                        'created_at': file_obj.created_at
                    })

        # Sort by created_at descending (newest first)
        all_files.sort(key=lambda x: x['created_at'] if x['created_at'] else '', reverse=True)

        return all_files

    def get_checkout_logs(self, obj):
        """
        Return interleaved list of checkouts and checkins for this asset.
        Sorted by created_at descending (newest first).
        Example order: checkout 3, checkin of checkout 2, checkout 2, checkin of checkout 1, checkout 1
        """
        logs = []

        # Get all checkouts with their checkins
        checkouts = obj.asset_checkouts.all().select_related('asset_checkin').order_by('-created_at')

        for checkout in checkouts:
            # Add checkout entry
            logs.append({
                'type': 'checkout',
                'id': checkout.id,
                'ticket_number': checkout.ticket_number,
                'checkout_to': checkout.checkout_to,
                'location': checkout.location,
                'checkout_date': checkout.checkout_date,
                'return_date': checkout.return_date,
                'condition': checkout.condition,
                'notes': checkout.notes,
                'created_at': checkout.created_at
            })

            # Add checkin entry if exists
            if hasattr(checkout, 'asset_checkin') and checkout.asset_checkin:
                checkin = checkout.asset_checkin
                logs.append({
                    'type': 'checkin',
                    'id': checkin.id,
                    'checkout_id': checkout.id,
                    'ticket_number': checkin.ticket_number,
                    'checkin_date': checkin.checkin_date,
                    'condition': checkin.condition,
                    'location': checkin.location,
                    'notes': checkin.notes,
                    'created_at': checkin.created_at
                })

        # Sort all entries by created_at descending (newest first)
        logs.sort(key=lambda x: x['created_at'] if x['created_at'] else '', reverse=True)

        return logs

    def get_audits(self, obj):
        """Return list of audits for this asset (via audit_schedules)."""
        audits_list = []

        # Get audit schedules that have completed audits
        schedules = obj.audit_schedules.filter(is_deleted=False).select_related('audit').order_by('-created_at')

        for schedule in schedules:
            if hasattr(schedule, 'audit') and schedule.audit and not schedule.audit.is_deleted:
                audit = schedule.audit
                audits_list.append({
                    'id': audit.id,
                    'schedule_id': schedule.id,
                    'schedule_date': schedule.date,
                    'schedule_notes': schedule.notes,
                    'audit_date': audit.audit_date,
                    'location': audit.location,
                    'user_id': audit.user_id,
                    'notes': audit.notes,
                    'created_at': audit.created_at
                })

        return audits_list

    def get_history(self, obj):
        """
        Returns checkout/checkin history.
        Active checkout on top, then checkout/checkin pairs ordered by recent checkin.
        """
        history = []
        # Get all checkouts, active first (no checkin), then by checkin date desc
        checkouts = obj.asset_checkouts.all().select_related('asset_checkin').prefetch_related(
            'files', 'asset_checkin__files'
        ).order_by('asset_checkin', '-created_at')

        for checkout in checkouts:
            # Add checkout entry
            checkout_files = [{
                'id': f.id,
                'file': f.file.url if f.file else None,
                'from': 'asset_checkout'
            } for f in checkout.files.filter(is_deleted=False)]

            history.append({
                'type': 'checkout',
                'id': checkout.id,
                'ticket_number': checkout.ticket_number,
                'checkout_to': checkout.checkout_to,
                'location': checkout.location,
                'return_date': checkout.return_date,
                'condition': checkout.condition,
                'revenue': str(checkout.revenue) if checkout.revenue else None,
                'notes': checkout.notes,
                'created_at': checkout.created_at,
                'files': checkout_files,
                'is_active': not hasattr(checkout, 'asset_checkin') or checkout.asset_checkin is None
            })

            # Add checkin entry if exists
            try:
                checkin = checkout.asset_checkin
                if checkin:
                    checkin_files = [{
                        'id': f.id,
                        'file': f.file.url if f.file else None,
                        'from': 'asset_checkin'
                    } for f in checkin.files.filter(is_deleted=False)]

                    history.append({
                        'type': 'checkin',
                        'id': checkin.id,
                        'checkout_id': checkout.id,
                        'ticket_number': checkin.ticket_number,
                        'checkin_date': checkin.checkin_date,
                        'condition': checkin.condition,
                        'notes': checkin.notes,
                        'files': checkin_files
                    })
            except AssetCheckin.DoesNotExist:
                pass

        return history

    def get_components(self, obj):
        """
        Returns only components that have active checkouts referencing this asset.
        Each entry includes checkin history.
        """
        components = []

        # Get component checkouts where this asset is the target
        component_checkouts = ComponentCheckout.objects.filter(asset=obj).select_related(
            'component'
        ).prefetch_related('component_checkins').order_by('-checkout_date')

        for checkout in component_checkouts:
            # Only include active checkouts
            if checkout.remaining_quantity <= 0:
                continue

            checkins = [
                {
                    'id': ci.id,
                    'checkin_date': ci.checkin_date,
                    'quantity': ci.quantity,
                    'notes': ci.notes
                }
                for ci in checkout.component_checkins.all().order_by('-checkin_date')
            ]

            components.append({
                'id': checkout.id,
                'component_id': checkout.component.id,
                'component_name': checkout.component.name,
                'quantity': checkout.quantity,
                'checkout_date': checkout.checkout_date,
                'notes': checkout.notes,
                'remaining_quantity': checkout.remaining_quantity,
                'is_fully_returned': checkout.is_fully_returned,
                'checkins': checkins
            })

        return components

    def get_repairs(self, obj):
        """
        Returns repairs for this asset.
        """
        repairs = []
        for repair in obj.repair_assets.filter(is_deleted=False).order_by('-start_date'):
            repairs.append({
                'id': repair.id,
                'supplier_id': repair.supplier_id,
                'type': repair.type,
                'name': repair.name,
                'start_date': repair.start_date,
                'end_date': repair.end_date,
                'cost': str(repair.cost) if repair.cost else None,
                'notes': repair.notes,
            })

        return repairs

    def get_ticket_details(self, obj):
        """Return ticket details from context map, keyed by asset_id (display ID)."""
        return self.context.get("ticket_map", {}).get(obj.asset_id)

    def get_active_checkout(self, obj):
        """Return ID of active checkout (no checkin) or None."""
        checkout = obj.asset_checkouts.filter(asset_checkin__isnull=True).first()
        return checkout.id if checkout else None

# Serializer for asset bulk edit selected items
class AssetNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'asset_id', 'name', 'image']


class RecycleBinAssetSerializer(serializers.ModelSerializer):
    """Serializer for deleted assets in Recycle Bin with all necessary fields"""
    product = serializers.SerializerMethodField()
    deleted_at = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Asset
        fields = [
            'id', 'asset_id', 'name', 'image', 
            'product', 'supplier', 'location', 'deleted_at'
        ]
    
    def get_product(self, obj):
        """Return product with category and manufacturer IDs for frontend resolution"""
        if obj.product:
            return {
                'id': obj.product.id,
                'category': obj.product.category,
                'manufacturer': obj.product.manufacturer
            }
        return None


# Serializer for HD registration with category filter
class AssetHdRegistrationSerializer(serializers.ModelSerializer):
    status_details = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'asset_id', 'name', 'image', 'status_details', 'serial_number']

    def get_status_details(self, obj):
        return self.context.get("status_map", {}).get(obj.status)

class AssetCheckoutFileSerializer(serializers.ModelSerializer):
    file_from = serializers.CharField(default="asset_checkout", read_only=True)

    class Meta:
        model = AssetCheckoutFile
        fields = '__all__'


class AssetCheckoutListSerializer(serializers.ModelSerializer):
    """Read-only serializer for checkout list view."""
    files = AssetCheckoutFileSerializer(many=True, read_only=True)
    is_checked_in = serializers.SerializerMethodField()
    checkin_id = serializers.SerializerMethodField()

    class Meta:
        model = AssetCheckout
        fields = '__all__'

    def get_is_checked_in(self, obj):
        """Returns True if this checkout has been checked in."""
        return hasattr(obj, 'asset_checkin') and obj.asset_checkin is not None

    def get_checkin_id(self, obj):
        """Returns the checkin ID if checked in, else None."""
        if hasattr(obj, 'asset_checkin') and obj.asset_checkin:
            return obj.asset_checkin.id
        return None


class AssetCheckoutByEmployeeSerializer(serializers.ModelSerializer):
    """Serializer for active checkouts by employee with asset details."""
    asset_details = serializers.SerializerMethodField()

    class Meta:
        model = AssetCheckout
        fields = [
            'id', 'asset_details', 'checkout_to', 'condition', 'ticket_number', 'checkout_date'
        ]

    def get_asset_details(self, obj):
        """Return asset details (id, asset_id, name, image)."""
        if obj.asset:
            request = self.context.get('request')
            image_url = None
            if obj.asset.image:
                image_url = request.build_absolute_uri(obj.asset.image.url) if request else obj.asset.image.url
            return {
                'id': obj.asset.id,
                'asset_id': obj.asset.asset_id,
                'name': obj.asset.name,
                'image': image_url,
                'serial_number': obj.asset.serial_number
            }
        return None


class AssetCheckoutInstanceSerializer(serializers.ModelSerializer):
    """Serializer for retrieving a single checkout instance with full asset details."""
    asset_details = serializers.SerializerMethodField()
    files = AssetCheckoutFileSerializer(many=True, read_only=True)

    class Meta:
        model = AssetCheckout
        fields = [
            'id', 'asset', 'asset_details', 'checkout_to', 'checkout_date',
            'return_date', 'location', 'condition', 'notes', 'ticket_number', 'files'
        ]

    def get_asset_details(self, obj):
        """Return comprehensive asset details."""
        if not obj.asset:
            return None

        asset = obj.asset
        request = self.context.get('request')
        image_url = None
        if asset.image:
            image_url = request.build_absolute_uri(asset.image.url) if request else asset.image.url

        return {
            'id': asset.id,
            'asset_id': asset.asset_id,
            'name': asset.name,
            'image': image_url,
            'serial_number': asset.serial_number,
            'status': asset.status,
            'product': asset.product_id,
            'purchase_date': asset.purchase_date,
            'purchase_cost': str(asset.purchase_cost) if asset.purchase_cost else None,
            'warranty_expiration': asset.warranty_expiration,
            'end_of_life': asset.end_of_life,
            'supplier': asset.supplier,
            'manufacturer': asset.manufacturer,
        }

class AssetCheckoutSerializer(serializers.ModelSerializer):
    # These fields are populated from ticket data, not from form input
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all(), required=False)
    checkout_to = serializers.IntegerField(required=False)
    location = serializers.IntegerField(required=False)
    checkout_date = serializers.DateField(required=False)
    return_date = serializers.DateField(required=False)
    # ticket_number is required from frontend for validation
    ticket_number = serializers.CharField(required=True)
    # created_by tracks who performed the checkout
    created_by = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = AssetCheckout
        fields = '__all__'

    def validate(self, data):
        ticket_number = data.get('ticket_number')
        status_id = data.get('status') or self.context.get('request').data.get('status')

        # --- Ticket Validations ---
        if not ticket_number:
            raise serializers.ValidationError({"ticket_number": "A ticket is required to check out this asset."})

        ticket = get_ticket_by_number(ticket_number)
        if not ticket or ticket.get("warning"):
            raise serializers.ValidationError({"ticket_number": "Ticket not found."})

        if ticket.get("is_resolved", False):
            raise serializers.ValidationError({"ticket_number": "Ticket is already resolved."})

        # --- Asset Validations (from ticket) ---
        # ticket['asset'] contains the display asset_id (e.g., "AST-20260110-00030-43A7")
        ticket_asset_id = ticket.get('asset')
        if not ticket_asset_id:
            raise serializers.ValidationError({"asset": "Ticket has no asset assigned."})

        try:
            asset = Asset.objects.get(asset_id=ticket_asset_id)
        except Asset.DoesNotExist:
            raise serializers.ValidationError({"asset": "Asset not found."})

        if asset.is_deleted:
            raise serializers.ValidationError({"asset": "Cannot check out a deleted asset."})

        if AssetCheckout.objects.filter(asset=asset, asset_checkin__isnull=True).exists():
            raise serializers.ValidationError({
                "asset": "This asset is already checked out and not yet checked in."
            })

        # --- Status Validations ---
        if not status_id:
            raise serializers.ValidationError({"status": "Status is required for checkout."})

        status_details = get_status_by_id(status_id)
        if not status_details or status_details.get("warning"):
            raise serializers.ValidationError({"status": "Status not found."})

        if status_details.get("category") != "asset":
            raise serializers.ValidationError({
                "status": "Invalid status. Only asset statuses are allowed for checkout."
            })

        if status_details.get("type") != "deployed":
            raise serializers.ValidationError({
                "status": "Invalid status type for checkout. Must be 'deployed'."
            })

        # --- Date Validations (from ticket) ---
        checkout_date = ticket.get('checkout_date')
        return_date = ticket.get('return_date')

        # Parse checkout_date if string
        if checkout_date and isinstance(checkout_date, str):
            checkout_date = datetime.strptime(checkout_date, "%Y-%m-%d").date()

        # Validate checkout is not before the ticket's checkout_date
        if checkout_date:
            today = datetime.now().date()
            if today < checkout_date:
                raise serializers.ValidationError({
                    "checkout_date": f"Cannot check out before the scheduled checkout date ({checkout_date})."
                })

        # Validate return_date is not before checkout_date
        if checkout_date and return_date:
            if isinstance(return_date, str):
                return_date = datetime.strptime(return_date, "%Y-%m-%d").date()
            if return_date < checkout_date:
                raise serializers.ValidationError({
                    "return_date": "Return date cannot be before checkout date."
                })

        # Store ticket data and asset for create method
        data['_ticket'] = ticket
        data['_asset'] = asset

        return data

    def create(self, validated_data):
        # Pop internal data
        ticket = validated_data.pop('_ticket')
        asset = validated_data.pop('_asset')
        files_data = validated_data.pop('files', [])

        # Get location ID from location_details (from external location system)
        location_details = ticket.get('location_details')
        location_id = None
        if location_details:
            loc_id = location_details.get('id')
            if isinstance(loc_id, int):
                location_id = loc_id
            elif isinstance(loc_id, str) and loc_id.isdigit():
                location_id = int(loc_id)

        if location_id is None:
            raise serializers.ValidationError({"location": "Valid location ID is required from ticket."})

        # Enforce values from ticket (backend sets these, not form)
        # ticket_number is already in validated_data from frontend, but ensure it matches ticket data
        validated_data['ticket_number'] = ticket.get('ticket_number')
        validated_data['asset'] = asset  # Use Asset object, not display asset_id string
        validated_data['checkout_to'] = ticket.get('employee')
        validated_data['location'] = location_id
        validated_data['checkout_date'] = ticket.get('checkout_date')
        validated_data['return_date'] = ticket.get('return_date')

        # Form data already in validated_data: condition, revenue, notes

        checkout = super().create(validated_data)

        # Handle file attachments
        request = self.context.get('request')
        if request and hasattr(request, 'FILES'):
            files = request.FILES.getlist('attachments') or request.FILES.getlist('image')
            for f in files:
                AssetCheckoutFile.objects.create(asset_checkout=checkout, file=f)

        for file_dict in files_data:
            AssetCheckoutFile.objects.create(asset_checkout=checkout, **file_dict)

        return checkout

class AssetCheckinFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCheckinFile
        fields = '__all__'

class AssetCheckinSerializer(serializers.ModelSerializer):
    files = AssetCheckinFileSerializer(many=True, required=False)
    # ticket_number is optional for check-in
    ticket_number = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = AssetCheckin
        fields = '__all__'

    def validate(self, data):
        checkout = data.get('asset_checkout')
        checkin_date = data.get('checkin_date', timezone.now())
        ticket_number = data.get('ticket_number')

        if not checkout:
            raise serializers.ValidationError({
                "asset_checkout": "Asset checkout is required."
            })

        # Prevent multiple checkins
        if AssetCheckin.objects.filter(asset_checkout=checkout).exists():
            raise serializers.ValidationError({
                "asset_checkout": "This asset has already been checked in."
            })

        # Make sure checkin happens after checkout
        if checkin_date < checkout.checkout_date:
            raise serializers.ValidationError({
                "checkin_date": "Cannot check in before checkout date."
            })

        # Optional ticket validation - if ticket_number provided, validate it exists
        if ticket_number:
            ticket = get_ticket_by_number(ticket_number)
            if not ticket or ticket.get("warning"):
                raise serializers.ValidationError({"ticket_number": "Ticket not found."})
            # Store ticket data for create method
            data['_ticket'] = ticket

        return data

    def create(self, validated_data):
        files_data = validated_data.pop('files', [])

        # Pop internal ticket data if present (not needed for model creation)
        validated_data.pop('_ticket', None)

        # ticket_number is already in validated_data from frontend

        checkin = AssetCheckin.objects.create(**validated_data)

        # Handle files uploaded via FormData
        request = self.context.get('request')
        if request and hasattr(request, 'FILES'):
            for f in request.FILES.getlist('attachments'):  # matches your frontend key
                AssetCheckinFile.objects.create(asset_checkin=checkin, file=f)

        # Also handle nested JSON files if any
        for file_dict in files_data:
            AssetCheckinFile.objects.create(asset_checkin=checkin, **file_dict)

        return checkin

# Component - List serializer for table display
class ComponentListSerializer(serializers.ModelSerializer):
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    active_checkout = serializers.SerializerMethodField()

    class Meta:
        model = Component
        fields = [
            'id', 'image', 'name', 'category_details', 'manufacturer_details',
            'quantity', 'available_quantity', 'minimum_quantity', 'active_checkout'
        ]

    def get_category_details(self, obj):
        return self.context.get("category_map", {}).get(obj.category)

    def get_manufacturer_details(self, obj):
        return self.context.get("manufacturer_map", {}).get(obj.manufacturer)

    def get_active_checkout(self, obj):
        # Check if there's an active checkout (not fully returned)
        checkout = obj.component_checkouts.filter(
            component_checkins__isnull=True
        ).first() or obj.component_checkouts.exclude(
            id__in=ComponentCheckout.objects.annotate(
                total_returned=models.Sum('component_checkins__quantity')
            ).filter(total_returned__gte=models.F('quantity')).values('id')
        ).first()
        return checkout.id if checkout else None


# Component - Instance serializer for view page
class ComponentInstanceSerializer(serializers.ModelSerializer):
    category_details = serializers.SerializerMethodField()
    manufacturer_details = serializers.SerializerMethodField()
    supplier_details = serializers.SerializerMethodField()
    location_details = serializers.SerializerMethodField()
    available_quantity = serializers.SerializerMethodField()
    active_checkouts = serializers.SerializerMethodField()
    checkout_history = serializers.SerializerMethodField()

    class Meta:
        model = Component
        fields = '__all__'

    def get_category_details(self, obj):
        return self.context.get("category_map", {}).get(obj.category)

    def get_manufacturer_details(self, obj):
        return self.context.get("manufacturer_map", {}).get(obj.manufacturer)

    def get_supplier_details(self, obj):
        return self.context.get("supplier_map", {}).get(obj.supplier)

    def get_location_details(self, obj):
        """Return location details from context map or direct API call."""
        if not obj.location:
            return None
        # First try to get from context map (faster, already fetched)
        location_map = self.context.get("location_map", {})
        if location_map and obj.location in location_map:
            loc = location_map[obj.location]
            return {
                'id': loc.get('id'),
                'name': loc.get('display_name') or loc.get('city') or loc.get('name')
            }
        # Fallback to direct API call
        location = get_location_by_id(obj.location)
        if not location or location.get('warning'):
            return None
        return {
            'id': location.get('id'),
            'name': location.get('display_name') or location.get('city') or location.get('name')
        }

    def get_available_quantity(self, obj):
        """Return available quantity (property from model)."""
        return obj.available_quantity

    def _get_checkout_data(self, checkout):
        """Helper to format checkout data."""
        checkins = [{
            'id': ci.id,
            'checkin_date': ci.checkin_date,
            'quantity': ci.quantity,
            'notes': ci.notes,
            'created_at': ci.created_at,
        } for ci in checkout.component_checkins.all().order_by('-checkin_date')]

        return {
            'id': checkout.id,
            'asset_id': checkout.asset.id if checkout.asset else None,
            'asset_name': checkout.asset.name if checkout.asset else None,
            'asset_displayed_id': checkout.asset.asset_id if checkout.asset else None,
            'quantity': checkout.quantity,
            'checkout_date': checkout.checkout_date,
            'notes': checkout.notes,
            'remaining_quantity': checkout.remaining_quantity,
            'total_checked_in': checkout.total_checked_in,
            'is_fully_returned': checkout.is_fully_returned,
            'checkins': checkins,
            'created_at': checkout.created_at,
        }

    def get_active_checkouts(self, obj):
        """Returns active (not fully returned) checkouts for this component."""
        checkouts = obj.component_checkouts.select_related('asset').prefetch_related(
            'component_checkins'
        ).order_by('-checkout_date')

        return [
            self._get_checkout_data(checkout)
            for checkout in checkouts
            if not checkout.is_fully_returned
        ]

    def get_checkout_history(self, obj):
        """Returns all checkout/checkin history for this component."""
        checkouts = obj.component_checkouts.select_related('asset').prefetch_related(
            'component_checkins'
        ).order_by('-checkout_date')

        return [self._get_checkout_data(checkout) for checkout in checkouts]


# Component - Name serializer for bulk edit display
class ComponentNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = ['id', 'name', 'image']


class RecycleBinComponentSerializer(serializers.ModelSerializer):
    """Serializer for deleted components in Recycle Bin with all necessary fields"""
    deleted_at = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Component
        fields = [
            'id', 'name', 'image',
            'category', 'manufacturer', 
            'supplier', 'location', 'deleted_at'
        ]


# Component - CRUD serializer
class ComponentSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Component
        fields = '__all__'

    def validate(self, data):
        name = data.get('name')
        instance = self.instance

        if name:
            # Normalize spacing and apply Title Case
            normalized_name = " ".join(name.split()).strip().title()
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

        # Allow checkout only if component still has stock
        available_components = [
            c for c in Component.objects.filter(is_deleted=False)
            if c.available_quantity > 0
        ]
        self.fields['component'].queryset = Component.objects.filter(
            id__in=[c.id for c in available_components]
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


class ComponentCheckoutListSerializer(serializers.ModelSerializer):
    """List serializer for component checkouts with related details."""
    component_details = serializers.SerializerMethodField()
    asset_details = serializers.SerializerMethodField()
    remaining_quantity = serializers.SerializerMethodField()
    is_fully_returned = serializers.SerializerMethodField()
    total_checked_in = serializers.SerializerMethodField()
    checkins = serializers.SerializerMethodField()

    class Meta:
        model = ComponentCheckout
        fields = [
            'id', 'component', 'component_details', 'asset', 'asset_details',
            'quantity', 'checkout_date', 'notes', 'created_at',
            'remaining_quantity', 'is_fully_returned', 'total_checked_in', 'checkins'
        ]

    def get_component_details(self, obj):
        return {
            'id': obj.component.id,
            'name': obj.component.name,
        } if obj.component else None

    def get_asset_details(self, obj):
        return {
            'id': obj.asset.id,
            'asset_id': obj.asset.asset_id,
            'name': obj.asset.name,
        } if obj.asset else None

    def get_remaining_quantity(self, obj):
        return obj.remaining_quantity

    def get_is_fully_returned(self, obj):
        return obj.is_fully_returned

    def get_total_checked_in(self, obj):
        return obj.total_checked_in

    def get_checkins(self, obj):
        """Get all checkins for this checkout."""
        checkins = obj.component_checkins.all().order_by('-checkin_date')
        return [{
            'id': ci.id,
            'checkin_date': ci.checkin_date,
            'quantity': ci.quantity,
            'notes': ci.notes,
            'created_at': ci.created_at,
        } for ci in checkins]


class ComponentCheckinListSerializer(serializers.ModelSerializer):
    """List serializer for component checkins with related details."""
    checkout_details = serializers.SerializerMethodField()
    component_details = serializers.SerializerMethodField()
    asset_details = serializers.SerializerMethodField()

    class Meta:
        model = ComponentCheckin
        fields = [
            'id', 'component_checkout', 'checkout_details',
            'component_details', 'asset_details',
            'checkin_date', 'quantity', 'notes', 'created_at'
        ]

    def get_checkout_details(self, obj):
        checkout = obj.component_checkout
        return {
            'id': checkout.id,
            'quantity': checkout.quantity,
            'checkout_date': checkout.checkout_date,
            'remaining_quantity': checkout.remaining_quantity,
            'is_fully_returned': checkout.is_fully_returned,
        } if checkout else None

    def get_component_details(self, obj):
        component = obj.component_checkout.component if obj.component_checkout else None
        return {
            'id': component.id,
            'name': component.name,
        } if component else None

    def get_asset_details(self, obj):
        asset = obj.component_checkout.asset if obj.component_checkout else None
        return {
            'id': asset.id,
            'asset_id': asset.asset_id,
            'name': asset.name,
        } if asset else None


class AuditScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditSchedule
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Limit dropdown to non-deleted assets only
        self.fields['asset'].queryset = Asset.objects.filter(is_deleted=False)

    def validate(self, data):
        asset = data.get('asset') or getattr(self.instance, 'asset', None)
        date = data.get('date') or getattr(self.instance, 'date', None)

        # Ensure asset is not deleted
        if asset and asset.is_deleted:
            raise serializers.ValidationError({
                "asset": "Cannot create an audit schedule for a deleted asset."
            })

        # Check for duplicate audit schedule (same asset + same date)
        if asset and date:
            duplicate = AuditSchedule.objects.filter(
                asset=asset,
                date=date,
                is_deleted=False
            ).exclude(pk=self.instance.pk if self.instance else None).exists()

            if duplicate:
                raise serializers.ValidationError({
                    "date": f"An audit schedule already exists for this asset on {date}."
                })

        return data


class AuditScheduleListSerializer(serializers.ModelSerializer):
    """List serializer for audit schedules with asset details."""
    asset_details = serializers.SerializerMethodField()
    has_audit = serializers.SerializerMethodField()

    class Meta:
        model = AuditSchedule
        fields = ['id', 'asset', 'asset_details', 'date', 'notes', 'has_audit', 'created_at', 'updated_at']

    def get_asset_details(self, obj):
        return self.context.get("asset_map", {}).get(obj.asset_id)

    def get_has_audit(self, obj):
        return hasattr(obj, 'audit') and obj.audit is not None and not obj.audit.is_deleted


class AuditFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditFile
        fields = '__all__'


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = '__all__'

    def validate(self, data):
        audit_date = data.get('audit_date')
        audit_schedule = data.get('audit_schedule')

        if audit_schedule and audit_date:
            # Audit date must be on or after schedule date
            if audit_date < audit_schedule.date:
                raise serializers.ValidationError({
                    'audit_date': "Audit date cannot be before the scheduled date."
                })

        return data


class AuditListSerializer(serializers.ModelSerializer):
    """List serializer for completed audits with asset, location, user details."""
    asset_details = serializers.SerializerMethodField()
    location_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    schedule_date = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = [
            'id', 'audit_schedule', 'asset_details', 'location', 'location_details',
            'user_id', 'user_details', 'audit_date', 'schedule_date', 'notes',
            'files', 'created_at'
        ]

    def get_asset_details(self, obj):
        if obj.audit_schedule:
            return self.context.get("asset_map", {}).get(obj.audit_schedule.asset_id)
        return None

    def get_location_details(self, obj):
        return self.context.get("location_map", {}).get(obj.location)

    def get_user_details(self, obj):
        return self.context.get("user_map", {}).get(obj.user_id)

    def get_schedule_date(self, obj):
        if obj.audit_schedule:
            return obj.audit_schedule.date
        return None

    def get_files(self, obj):
        return [{
            'id': f.id,
            'file': f.file.url if f.file else None
        } for f in obj.audit_files.filter(is_deleted=False)]

class RepairListSerializer(serializers.ModelSerializer):
    asset_details = serializers.SerializerMethodField()
    status_details = serializers.SerializerMethodField()
    class Meta:
        model = Repair
        fields = [
            'id', 'asset_details', 'status_details', 'type', 'name',
            'start_date', 'end_date', 'cost'
        ]

    def get_asset_details(self, obj):
        return self.context.get("asset_map", {}).get(obj.asset_id)
    
    def get_status_details(self, obj):
        return self.context.get("status_map", {}).get(obj.status_id)
    
    
class RepairSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Repair
        fields = '__all__'
    
    def validate(self, attrs):
        """Validate repair data including status category and prevent duplicates."""
        asset = attrs.get('asset') or getattr(self.instance, 'asset', None)
        name = attrs.get('name') or getattr(self.instance, 'name', None)
        status_id = attrs.get('status_id') or getattr(self.instance, 'status_id', None)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', timezone.localdate())

        # Validate status category - must be 'repair' category
        if status_id:
            status_details = get_status_by_id(status_id)
            if not status_details or status_details.get("warning"):
                raise serializers.ValidationError({"status_id": "Status not found."})

            status_category = status_details.get("category")
            if status_category != "repair":
                raise serializers.ValidationError({
                    "status_id": "Invalid status. Only repair statuses are allowed for repairs."
                })

        # Ensure date-only (no datetime)
        if isinstance(start_date, timezone.datetime):
            start_date = start_date.date()

        # heck for existing repair with same asset, name, and date
        # Normalize the repair name for comparison/storage (Title Case)
        if name:
            normalized_name = " ".join(name.split()).strip().title()
            attrs['name'] = normalized_name
        else:
            normalized_name = None

        duplicate = False
        if normalized_name:
            duplicate = (
                Repair.objects.filter(
                    asset=asset,
                    name__iexact=normalized_name,
                    start_date=start_date,
                    is_deleted=False
                )
                .exclude(pk=self.instance.pk if self.instance else None)
                .exists()
            )

        if duplicate:
            raise serializers.ValidationError({
                "non_field_errors": [
                    "A repair record with the same asset, name, and start date already exists."
                ]
            })

        attrs['start_date'] = start_date
        return attrs
    
class RepairFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairFile
        fields = '__all__'

class RepairInstanceSerializer(serializers.ModelSerializer):
    files = RepairFileSerializer(many=True, read_only=True)
    asset_details = serializers.SerializerMethodField()
    supplier_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Repair
        fields = '__all__'

    def get_asset_details(self, obj):
        return self.context.get("asset_map", {}).get(obj.asset_id)
    
    def get_supplier_details(self, obj):
        return self.context.get("supplier_map", {}).get(obj.supplier_id)

class DashboardStatsSerializer(serializers.Serializer):
    due_for_return = serializers.IntegerField()
    overdue_for_return = serializers.IntegerField()
    due_audits = serializers.IntegerField()
    upcoming_audits = serializers.IntegerField()
    overdue_audits = serializers.IntegerField()
    completed_audits = serializers.IntegerField()
    reached_end_of_life = serializers.IntegerField()
    upcoming_end_of_life = serializers.IntegerField()
    expired_warranties = serializers.IntegerField()
    expiring_warranties = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    # Additional metrics for charts
    total_asset_costs = serializers.DecimalField(max_digits=15, decimal_places=2, allow_null=True)
    asset_utilization = serializers.IntegerField()
    asset_categories = serializers.ListField(child=serializers.DictField(), allow_empty=True)
    asset_statuses = serializers.ListField(child=serializers.DictField(), allow_empty=True)


class AssetReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for AssetReportTemplate CRUD operations."""

    class Meta:
        model = AssetReportTemplate
        fields = ['id', 'name', 'user_id', 'filters', 'columns', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Validate template name uniqueness (per user if user_id provided)."""
        if not value or not value.strip():
            raise serializers.ValidationError("Template name cannot be empty.")

        # Normalize name
        normalized_name = " ".join(value.split()).strip()

        # Check for duplicate names (case insensitive)
        user_id = self.initial_data.get('user_id') or (self.instance.user_id if self.instance else None)

        queryset = AssetReportTemplate.objects.filter(
            name__iexact=normalized_name,
            is_deleted=False
        )

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("A template with this name already exists.")

        return normalized_name

    def validate_columns(self, value):
        """Validate that columns is a list of strings."""
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Columns must be a list.")
        if not all(isinstance(col, str) for col in value):
            raise serializers.ValidationError("All column IDs must be strings.")
        return value

    def validate_filters(self, value):
        """Validate that filters is a dictionary."""
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Filters must be an object/dictionary.")
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for ActivityLog model for activity report API responses."""

    # Format datetime as string for frontend display
    date = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    type = serializers.CharField(source='activity_type')
    item = serializers.SerializerMethodField()
    to_from = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'date', 'user', 'type', 'action', 'item', 'to_from', 'notes',
                  'datetime', 'user_id', 'activity_type', 'item_id',
                  'item_identifier', 'item_name', 'target_id', 'target_name']
        read_only_fields = ['id', 'date', 'user', 'item', 'to_from']

    def get_date(self, obj):
        """Format datetime for display."""
        if obj.datetime:
            return obj.datetime.strftime('%Y-%m-%d %I:%M:%S %p')
        return ''

    def get_user(self, obj):
        """Return user name or fallback to user_id."""
        if obj.user_name:
            return obj.user_name
        if obj.user_id:
            return f'User {obj.user_id}'
        return 'System'

    def get_item(self, obj):
        """Return formatted item string."""
        identifier = obj.item_identifier or str(obj.item_id)
        name = obj.item_name or ''
        if name:
            return f"{identifier} - {name}"
        return identifier

    def get_to_from(self, obj):
        """Return target name for checkout/checkin actions."""
        return obj.target_name or ''


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ActivityLog entries."""

    class Meta:
        model = ActivityLog
        fields = ['user_id', 'user_name', 'activity_type', 'action',
                  'item_id', 'item_identifier', 'item_name',
                  'target_id', 'target_name', 'notes', 'datetime']
        extra_kwargs = {
            'datetime': {'required': False},
            'user_name': {'required': False},
            'item_identifier': {'required': False},
            'item_name': {'required': False},
            'target_id': {'required': False},
            'target_name': {'required': False},
            'notes': {'required': False},
        }