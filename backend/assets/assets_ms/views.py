from rest_framework import viewsets, status
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now, localdate
from datetime import timedelta
from django.db.models import Sum, Value, F, Count, DecimalField
from django.db.models.functions import Coalesce
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from django.db import transaction
import logging
from assets_ms.services.contexts import *
from assets_ms.services.integration_help_desk import *
from assets_ms.services.integration_ticket_tracking import *

from assets_ms.services.activity_logger import (
    log_asset_activity,
    log_component_activity,
    log_audit_activity,
    log_repair_activity,
)

logger = logging.getLogger(__name__)

# If will add more views later or functionality, please create file on api folder or services folder
# Only viewsets here
class ProductViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Product.objects.filter(is_deleted=False).order_by('name')

    def get_serializer_class(self):
        # 1. Products Table (list)
        if self.action == "list":
            return ProductListSerializer

        # 2. Asset Registration dropdown
        if self.action == "asset_registration":
            return ProductAssetRegistrationSerializer
        
        # 3. Product View
        if self.action == "retrieve":
            return ProductInstanceSerializer
        
        # 4. Product Names
        if self.action == "names":
            return ProductNameSerializer
        
        # 5. Create, Update, Destroy
        return ProductSerializer
    
    # Build context maps for serializers
    def _build_context_maps(self):
        # categories
        category_map = cache.get("categories:map")
        if not category_map:
            categories = get_category_names()
            category_map = {c['id']: c for c in categories}
            cache.set("categories:map", category_map, 300)

        # manufacturers
        manufacturer_map = cache.get("manufacturers:map")
        if not manufacturer_map:
            manufacturers = get_manufacturer_names()
            manufacturer_map = {m['id']: m for m in manufacturers}
            cache.set("manufacturers:map", manufacturer_map, 300)

        # suppliers
        supplier_map = cache.get("suppliers:map")
        if not supplier_map:
            suppliers = get_supplier_names()
            supplier_map = {s['id']: s for s in suppliers}
            cache.set("suppliers:map", supplier_map, 300)

        # depreciations
        depreciation_map = cache.get("depreciations:map")
        if not depreciation_map:
            depreciations = get_depreciation_names()
            depreciation_map = {d['id']: d for d in depreciations}
            cache.set("depreciations:map", depreciation_map, 300)

        return {
            "category_map": category_map,
            "manufacturer_map": manufacturer_map,
            "supplier_map": supplier_map,
            "depreciation_map": depreciation_map,
        }
    
    def _build_asset_context_maps(self):
        """Build context maps needed for nested AssetListSerializer in ProductInstanceSerializer."""
        # statuses
        status_map = cache.get("statuses:map")
        if not status_map:
            statuses = get_status_names_assets()
            status_map = {s['id']: s for s in statuses}
            cache.set("statuses:map", status_map, 300)

        # products (for product_details - though in product view we already know the product)
        product_map = cache.get("products:map")
        if not product_map:
            products = Product.objects.filter(is_deleted=False)
            product_map = {p.id: p.name for p in products}
            cache.set("products:map", product_map, 300)

        # tickets
        ticket_map = cache.get("tickets:map")
        if not ticket_map:
            tickets = get_tickets_list()
            ticket_map = {t["asset"]: t for t in tickets}
            cache.set("tickets:map", ticket_map, 300)

        return {
            "status_map": status_map,
            "product_map": product_map,
            "ticket_map": ticket_map,
        }

    # Helper function for cached responses
    def cached_response(self, cache_key, queryset, serializer_class, many=True, context=None):
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        context = context or {}
        serializer = serializer_class(queryset, many=many, context=context)
        cache.set(cache_key, serializer.data, 300)
        return Response(serializer.data)
    
    
    def list(self, request, *args, **kwargs):
        quesryset = self.get_queryset()

        context_maps = self._build_context_maps()
        return self.cached_response(
            "products:list",
            quesryset,
            self.get_serializer_class(),
            many=True,
            context={**context_maps, 'request': request}
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        context_maps = self._build_context_maps()
        asset_context_maps = self._build_asset_context_maps()
        cache_key = f"products:detail:{instance.id}"
        return self.cached_response(
            cache_key,
            instance,
            self.get_serializer_class(),
            many=False,
            context={**context_maps, **asset_context_maps, 'request': request}
        )

    def invalidate_product_cache(self, product_id):
        cache.delete("products:list")
        cache.delete("products:names")
        cache.delete("products:asset-registration")
        cache.delete(f"products:detail:{product_id}")

    def perform_destroy(self, instance):
        # Check for referencing assets that are not deleted
        if instance.product_assets.filter(is_deleted=False).exists():
            raise ValidationError({
                "detail": "Cannot delete this product, it's being used by one or more active assets."
            })

        # If no active assets, allow soft delete
        instance.is_deleted = True
        instance.save()
        self.invalidate_product_cache(instance.id)

    def perform_create(self, serializer):
        instance = serializer.save()
        self.invalidate_product_cache(instance.id)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.invalidate_product_cache(instance.id)
    
    # Product names and image for bulk edit
    # names/?ids=1,2,3
    # names/?search=keyword
    # names/?ids=1,2,3&search=Lenovo
    @action(detail=False, methods=["get"], url_path='names')
    def names(self, request):
        """
        Return products with only id, name, and image.
        Optional query param: ?ids=1,2,3 or ?search=keyword
        """
        ids_param = request.query_params.get("ids")
        search = request.query_params.get("search")
        queryset = self.get_queryset()

        # Filter by IDs if provided
        if ids_param:
            try:
                ids = [int(i) for i in ids_param.split(",") if i.strip().isdigit()]
                queryset = queryset.filter(id__in=ids)
            except ValueError:
                return Response({"detail": "Invalid IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        if search:
            queryset = queryset.filter(name__icontains=search)

        # Don't cache search results - they need to be real-time for clone name generation
        if search:
            serializer = ProductNameSerializer(queryset, many=True)
            return Response(serializer.data)

        # Build a cache key specific for this set of IDs
        cache_key = "products:names"
        if ids_param:
            cache_key += f":{','.join(map(str, ids))}"

        return self.cached_response(
            cache_key,
            queryset,
            ProductNameSerializer,
            many=True
    )
    
    # Bulk edit
    # Receive list of IDs and partially or fully update all products with the same data, else return error
    @action(detail=False, methods=["patch"], url_path='bulk-edit')
    def bulk_edit(self, request):
        """
        Bulk edit multiple products.
        Payload (JSON):
        {
            "ids": [1, 2, 3],
            "data": {
                "manufacturer": 5,
                "depreciation": 2,
                "default_purchase_cost": "200.00"
            }
        }
        Or FormData with 'ids' (JSON string), 'data' (JSON string), and optional 'image' file.
        Only non-empty fields will be updated.
        """
        import json
        from django.core.files.base import ContentFile

        # Handle both JSON and FormData
        if request.content_type and 'multipart/form-data' in request.content_type:
            ids_raw = request.data.get("ids", "[]")
            data_raw = request.data.get("data", "{}")
            try:
                ids = json.loads(ids_raw) if isinstance(ids_raw, str) else ids_raw
                update_data = json.loads(data_raw) if isinstance(data_raw, str) else data_raw
            except json.JSONDecodeError:
                return Response({"detail": "Invalid JSON in ids or data."}, status=status.HTTP_400_BAD_REQUEST)

            uploaded_image = request.FILES.get("image")
            # Read image content into memory so it can be reused for multiple products
            if uploaded_image:
                image_content = uploaded_image.read()
                image_name = uploaded_image.name
            else:
                image_content = None
                image_name = None
            remove_image = request.data.get("remove_image") == "true"
        else:
            ids = request.data.get("ids", [])
            update_data = request.data.get("data", {})
            image_content = None
            image_name = None
            remove_image = False

        if not ids:
            return Response({"detail": "No IDs provided."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Remove blank values so they won't overwrite existing fields
        safe_data = {k: v for k, v in update_data.items() if v not in [None, "", [], {}]}

        # Check if there's anything to update (fields, image, or remove_image)
        has_field_updates = bool(safe_data)
        has_image_update = image_content is not None or remove_image

        if not has_field_updates and not has_image_update:
            return Response(
                {"detail": "No valid fields to update."},
                status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(id__in=ids, is_deleted=False)

        updated, failed = [], []

        # Check if name is being updated for multiple products
        base_name = safe_data.get("name")
        has_name_update = base_name is not None and len(ids) > 1

        for index, product in enumerate(products):
            # Create product-specific data with unique name suffix if needed
            product_data = safe_data.copy()
            if has_name_update:
                product_data["name"] = f"{base_name} ({index + 1})"

            serializer = ProductSerializer(
                product,
                data=product_data,
                partial=True  # important so blank fields won’t cause validation errors
            )

            if serializer.is_valid():
                instance = serializer.save()

                # Handle image update
                if image_content:
                    # Create a new ContentFile for each product from the stored bytes
                    instance.image.save(image_name, ContentFile(image_content), save=True)
                elif remove_image and instance.image:
                    instance.image.delete(save=False)
                    instance.image = None
                    instance.save()

                updated.append(product.id)
                cache.delete(f"products:detail:{product.id}")
            else:
                failed.append({
                    "id": product.id,
                    "errors": serializer.errors
                })
        
        cache.delete("products:list")
        cache.delete("products:names")
        cache.delete("products:asset-registration")

        return Response({
            "updated": updated,
            "failed": failed
        })
    
    # Bulk delete
    # Receive list of IDs and soft delete all products that are not referenced by active assets, else return error
    @action(detail=False, methods=["post"], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Soft delete multiple products by IDs.
        Expects payload: { "ids": [1, 2, 3] }
        """
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(id__in=ids, is_deleted=False)
        failed = []

        for product in products:
            try:
                self.perform_destroy(product)
            except ValidationError as e:
                failed.append({"id": product.id, "error": str(e.detail)})
        
        cache.delete("products:list")

        if failed:
            return Response({
                "detail": "Some products could not be deleted. Please check if they are assigned to active assets before trying again.",
                "failed": failed
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Products soft-deleted successfully."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path='asset-registration')
    def asset_registration(self, request):
        queryset = self.get_queryset()
        return self.cached_response(
            "products:asset-registration",
            queryset,
            self.get_serializer_class(),
            many=True,
        )

class AssetViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = Asset.objects.filter(is_deleted=False).order_by('name')
        # Optional: allow query param ?show_deleted=true
        if self.request.query_params.get('show_deleted') == 'true':
            queryset = Asset.objects.filter(is_deleted=True).order_by('name')
        return queryset
    
    def get_serializer_class(self):
        # 1. Assets Table (list)
        if self.action == "list":
            return AssetListSerializer
        if self.action == "retrieve":
            return AssetInstanceSerializer
        # 3. Create, Update, Destroy
        return AssetSerializer
    
    def _build_asset_context_maps(self):
        # statuses
        status_map = cache.get("statuses:map")
        if not status_map:
            statuses = get_status_names_assets()
            status_map = {s['id']: s for s in statuses}
            cache.set("statuses:map", status_map, 300)

        # products
        product_map = cache.get("products:map")
        if not product_map:
            products = Product.objects.filter(is_deleted=False)
            # products
            product_map = cache.get("products:map")
            if not product_map:
                products = Product.objects.filter(is_deleted=False)
                serialized = ProductNameSerializer(products, many=True).data
                product_map = {p['id']: p for p in serialized}
                cache.set("products:map", product_map, 300)

        # locations
        location_map = cache.get("locations:map")
        if not location_map:
            locations = get_locations_list()
            location_map = {l['id']: l for l in locations}
            cache.set("locations:map", location_map, 300)

        # tickets (unresolved)
        ticket_map = cache.get("tickets:map")
        if not ticket_map:
            tickets = get_tickets_list()
            if isinstance(tickets, list):
                ticket_map = {t["asset"]: t for t in tickets if t.get("asset")}
            else:
                ticket_map = {}
            cache.set("tickets:map", ticket_map, 300)

        return {
            "status_map": status_map,
            "product_map": product_map,
            "location_map": location_map,
            "ticket_map": ticket_map,
        }
    
    # Helper function for cached responses
    def cached_response(self, cache_key, queryset, serializer_class, many=True, context=None):
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        context = context or {}
        serializer = serializer_class(queryset, many=many, context=context)
        cache.set(cache_key, serializer.data, 300)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        context_maps = self._build_asset_context_maps()
        return self.cached_response(
            "assets:list",
            queryset,
            self.get_serializer_class(),
            many=True,
            context={**context_maps, 'request': request}
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        context_maps = self._build_asset_context_maps()
        cache_key = f"assets:detail:{instance.id}"
        return self.cached_response(
            cache_key,
            instance,
            self.get_serializer_class(),
            many=False,
            context={**context_maps, 'request': request}
        )
    
    def invalidate_asset_cache(self, asset_id):
        cache.delete("assets:list")
        cache.delete(f"assets:detail:{asset_id}")
        cache.delete("assets:names")
        cache.delete("tickets:map")  # Also invalidate ticket cache
        # Also invalidate the raw tickets list cache (used by get_tickets_list)
        cache.delete("contexts:list:tickets:None:50")
        cache.delete(f"contexts:tickets:asset:{asset_id}:unresolved")
        cache.delete(f"contexts:tickets:asset:{asset_id}:all")

    @action(detail=True, methods=['post'], url_path='invalidate-cache')
    def invalidate_cache(self, request, pk=None):
        """
        Endpoint to invalidate cache for a specific asset.
        Called by other services (e.g., Tickets) when related data changes.
        """
        self.invalidate_asset_cache(pk)
        return Response({"status": "cache invalidated", "asset_id": pk})

    def perform_destroy(self, instance):
        errors = []

        # Check for active checkouts (no checkin yet)
        if instance.asset_checkouts.filter(asset_checkin__isnull=True).exists():
            errors.append("This asset is currently checked out and not yet checked in. Please check in the asset before deleting it or perform a check-in and delete checkout.")

        # If any blocking relationships exist, raise error
        if errors:
            raise ValidationError({
                "detail": "Cannot delete this asset because:\n- " + "\n- ".join(errors)
            })

        # Otherwise, perform soft delete
        instance.is_deleted = True
        instance.save()
        self.invalidate_asset_cache(instance.id)

    def perform_create(self, serializer):
        validated = serializer.validated_data

        product = validated.get("product")
        supplier = validated.get("supplier")
        purchase_cost = validated.get("purchase_cost")

        # Auto-assign supplier from product.default_supplier
        if supplier is None and product and product.default_supplier:
            supplier = product.default_supplier

        # Auto-assign purchase_cost from product.default_purchase_cost
        if purchase_cost is None and product and product.default_purchase_cost is not None:
            purchase_cost = product.default_purchase_cost

        serializer.save(
            supplier=supplier,
            purchase_cost=purchase_cost
        )

        asset = serializer.instance
        self.invalidate_asset_cache(asset.id)

        # Log activity
        log_asset_activity(
            action='Create',
            asset=asset,
            notes=f"Asset '{asset.name}' created"
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        self.invalidate_asset_cache(instance.id)

        # Log activity
        log_asset_activity(
            action='Update',
            asset=instance,
            notes=f"Asset '{instance.name}' updated"
        )
    
    @action(detail=False, methods=['get'], url_path='by-product/(?P<product_id>\d+)')
    def by_product(self, request, product_id=None):
        """Get all assets for a specific product"""
        assets = Asset.objects.filter(product=product_id, is_deleted=False).order_by('name')
        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """List all soft-deleted assets"""
        assets = Asset.objects.filter(is_deleted=True).order_by('name')
        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def recover(self, request, pk=None):
        """Recover a soft-deleted asset"""
        try:
            asset = Asset.objects.get(pk=pk, is_deleted=True)
            asset.is_deleted = False
            asset.save()
            cache.delete(f"assets:detail:{asset.id}")
            serializer = self.get_serializer(asset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "Asset not found or already active."},
                status=status.HTTP_404_NOT_FOUND
            )
        
    @action(detail=False, methods=['get'], url_path='generate-asset-id')
    def generate_asset_id(self, request):
        today = timezone.now().strftime('%Y%m%d')
        prefix = f"AST-{today}-"
        last_asset = Asset.objects.filter(asset_id__startswith=prefix).order_by('-asset_id').first()

        if last_asset:
            try:
                seq = int(last_asset.asset_id.split('-')[2]) + 1
            except:
                seq = 1
        else:
            seq = 1

        random_suffix = uuid.uuid4().hex[:4].upper()
        new_id = f"{prefix}{seq:05d}-{random_suffix}"

        return Response({"asset_id": new_id})
    
    # assets/{asset_id}/update-status/
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Update asset status with validation based on checkout state.
        Expects: { "status": <id>, "isCheckout": <bool> }
        - If isCheckout=true: status type must be 'deployed'
        - If isCheckout=false: status type must be 'deployable', 'undeployable', 'pending', or 'archived'
        """
        VALID_CHECKIN_STATUS_TYPES = ['deployable', 'undeployable', 'pending', 'archived']

        try:
            asset = Asset.objects.get(pk=pk, is_deleted=False)
        except Asset.DoesNotExist:
            return Response(
                {"detail": "Asset not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        status_id = request.data.get('status')
        is_checkout = request.data.get('isCheckout', False)

        if not status_id:
            return Response(
                {"status": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch and validate status from Contexts service
        from assets_ms.services.contexts import get_status_by_id
        status_details = get_status_by_id(status_id)

        if not status_details or status_details.get("warning"):
            return Response(
                {"status": "Status not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Must be 'asset' category
        status_category = status_details.get("category")
        if status_category != "asset":
            return Response(
                {"status": "Invalid status. Only asset statuses are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate type based on isCheckout
        status_type = status_details.get("type")
        if is_checkout:
            if status_type != "deployed":
                return Response(
                    {"status": "Invalid status type for checkout. Must be 'deployed'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            if status_type not in VALID_CHECKIN_STATUS_TYPES:
                return Response(
                    {"status": f"Invalid status type. Allowed types: {', '.join(VALID_CHECKIN_STATUS_TYPES)}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Update asset status
        asset.status = status_id
        asset.save(update_fields=['status'])

        # Invalidate cache
        self.invalidate_asset_cache(asset.id)

        serializer = self.get_serializer(asset)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Asset names for bulk edit
    @action(detail=False, methods=["get"], url_path='names')
    def names(self, request):
        """
        Return assets with only id, asset_id, name, and image.
        Optional query param: ?ids=1,2,3 or ?search=keyword
        """
        ids_param = request.query_params.get("ids")
        search = request.query_params.get("search")
        queryset = self.get_queryset()

        # Filter by IDs if provided
        if ids_param:
            try:
                ids = [int(i) for i in ids_param.split(",") if i.strip().isdigit()]
                queryset = queryset.filter(id__in=ids)
            except ValueError:
                return Response({"detail": "Invalid IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        if search:
            queryset = queryset.filter(name__icontains=search)

        # Don't cache search results - they need to be real-time for clone name generation
        if search:
            serializer = AssetNameSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)

        # Build a cache key specific for this set of IDs
        cache_key = "assets:names"
        if ids_param:
            cache_key += f":{','.join(map(str, ids))}"

        return self.cached_response(
            cache_key,
            queryset,
            AssetNameSerializer,
            many=True,
            context={'request': request}
        )
    
    # Bulk edit
    @action(detail=False, methods=["patch"], url_path='bulk-edit')
    def bulk_edit(self, request):
        """
        Bulk edit multiple assets.
        Payload (JSON):
        {
            "ids": [1, 2, 3],
            "data": {
                "status": 5,
                "supplier": 2,
                "location": 3,
                "notes": "Updated in bulk"
            }
        }
        Or FormData with 'ids' (JSON string), 'data' (JSON string), and optional 'image' file.
        Only non-empty fields will be updated.
        """
        import json
        from django.core.files.base import ContentFile

        # Handle both JSON and FormData
        if request.content_type and 'multipart/form-data' in request.content_type:
            ids_raw = request.data.get("ids", "[]")
            data_raw = request.data.get("data", "{}")
            try:
                ids = json.loads(ids_raw) if isinstance(ids_raw, str) else ids_raw
                update_data = json.loads(data_raw) if isinstance(data_raw, str) else data_raw
            except json.JSONDecodeError:
                return Response({"detail": "Invalid JSON in ids or data."}, status=status.HTTP_400_BAD_REQUEST)

            uploaded_image = request.FILES.get("image")
            if uploaded_image:
                image_content = uploaded_image.read()
                image_name = uploaded_image.name
            else:
                image_content = None
                image_name = None
            remove_image = request.data.get("remove_image") == "true"
        else:
            ids = request.data.get("ids", [])
            update_data = request.data.get("data", {})
            image_content = None
            image_name = None
            remove_image = False

        if not ids:
            return Response({"detail": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Remove blank values so they won't overwrite existing fields
        safe_data = {k: v for k, v in update_data.items() if v not in [None, "", [], {}]}

        # Check if there's anything to update (fields, image, or remove_image)
        has_field_updates = bool(safe_data)
        has_image_update = image_content is not None or remove_image

        if not has_field_updates and not has_image_update:
            return Response(
                {"detail": "No valid fields to update."},
                status=status.HTTP_400_BAD_REQUEST
            )

        assets = Asset.objects.filter(id__in=ids, is_deleted=False)
        updated, failed = [], []

        # Check if name is being updated for multiple assets
        base_name = safe_data.get("name")
        has_name_update = base_name is not None and len(ids) > 1

        # Process each asset
        for index, asset in enumerate(assets):
            # Create asset-specific data with unique name suffix if needed
            asset_data = safe_data.copy()
            if has_name_update:
                asset_data["name"] = f"{base_name} ({index + 1})"

            serializer = AssetSerializer(
                asset,
                data=asset_data,
                partial=True
            )

            if serializer.is_valid():
                instance = serializer.save()

                # Handle image update
                if image_content:
                    instance.image.save(image_name, ContentFile(image_content), save=True)
                elif remove_image and instance.image:
                    instance.image.delete(save=False)
                    instance.image = None
                    instance.save()

                updated.append(asset.id)
                cache.delete(f"assets:detail:{asset.id}")
            else:
                failed.append({
                    "id": asset.id,
                    "errors": serializer.errors
                })

        cache.delete("assets:list")
        cache.delete("assets:names")

        return Response({
            "updated": updated,
            "failed": failed
        })

    # Bulk delete
    @action(detail=False, methods=["post"], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Soft delete multiple assets by IDs.
        Expects payload: { "ids": [1, 2, 3] }
        """
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        assets = Asset.objects.filter(id__in=ids, is_deleted=False)
        failed = []

        for asset in assets:
            try:
                self.perform_destroy(asset)
            except ValidationError as e:
                failed.append({"id": asset.id, "error": str(e.detail)})
        
        cache.delete("assets:list")

        if failed:
            return Response({
                "detail": "Some assets could not be deleted.",
                "failed": failed
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Assets deleted successfully."}, status=status.HTTP_200_OK)

class AssetCheckoutViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action == "list":
            return AssetCheckoutListSerializer
        return AssetCheckoutSerializer

    def get_queryset(self):
        # All checkouts (excluding deleted assets)
        return AssetCheckout.objects.select_related('asset').filter(
            asset__is_deleted=False
        ).order_by('-checkout_date')
    
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use /checkout-with-status/ to create checkouts."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Hard delete not allowed. Use soft delete."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """List only active checkouts (not yet checked in)"""
        queryset = AssetCheckout.objects.select_related('asset').filter(
            asset_checkin__isnull=True,
            asset__is_deleted=False
        ).order_by('-checkout_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='checkout-with-status')
    def checkout_with_status(self, request):
        """
        Atomically create check-out, update asset status, and resolve ticket.
        Serializer handles all validations and ticket-to-checkout data mapping.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status_id = request.data.get("status")

        try:
            with transaction.atomic():
                # 1. Create checkout (serializer handles validations, data mapping, file attachments)
                checkout = serializer.save()

                # 2. Update asset status
                asset = checkout.asset
                asset.status = status_id
                asset.save(update_fields=["status"])

                # 3. Resolve the ticket that triggered this checkout
                ticket_id = checkout.ticket_id
                resolve_ticket(ticket_id, asset_checkout_id=checkout.id)

                # 4. Resolve overlapping tickets for the same asset
                self._resolve_overlapping_tickets(checkout, ticket_id)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate cache
        cache.delete(f"assets:detail:{asset.id}")

        return Response(
            {"success": "Checkout, attachments, and status update completed successfully."},
            status=status.HTTP_201_CREATED
        )

    def _resolve_overlapping_tickets(self, checkout, current_ticket_id):
        """Resolve other unresolved tickets that overlap with this checkout period."""
        asset_id = checkout.asset.id
        unresolved_tickets = fetch_resource_list(
            f"tickets/by-asset/{asset_id}",
            params={"is_resolved": False}
        )

        if isinstance(unresolved_tickets, dict):
            tickets = unresolved_tickets.get('results', [])
        elif isinstance(unresolved_tickets, list):
            tickets = unresolved_tickets
        else:
            tickets = []

        current_start = checkout.checkout_date
        current_end = checkout.return_date

        if isinstance(current_start, str):
            current_start = datetime.strptime(current_start, "%Y-%m-%d").date()
        if isinstance(current_end, str):
            current_end = datetime.strptime(current_end, "%Y-%m-%d").date()

        for t in tickets:
            if t["id"] == current_ticket_id:
                continue

            if not t.get("checkout_date") or not t.get("return_date"):
                continue

            ticket_start = datetime.strptime(t["checkout_date"], "%Y-%m-%d").date()
            ticket_end = datetime.strptime(t["return_date"], "%Y-%m-%d").date()

            if ticket_start <= current_end and current_start <= ticket_end:
                resolve_ticket(t["id"])

class AssetCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCheckinSerializer

    def get_queryset(self):
        return AssetCheckin.objects.select_related('asset_checkout', 'asset_checkout__asset').order_by('-checkin_date')
    
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use /checkin-with-status/ to create checkins."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Hard delete not allowed. Use soft delete."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'], url_path='checkin-with-status')
    def checkin_with_status(self, request):
        """
        Atomically create check-in, attach files, and update asset status.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        status_id = request.data.get("status")

        try:
            with transaction.atomic():
                # Create check-in (serializer handles file attachments)
                checkin = serializer.save()

                # Update asset status
                asset = checkin.asset_checkout.asset

                # Validate status type
                from assets_ms.services.contexts import get_status_by_id
                status_details = get_status_by_id(status_id)

                if not status_details:
                    raise ValueError("Status not found.")

                VALID_CHECKIN_STATUS_TYPES = ['deployable', 'undeployable', 'pending', 'archived']
                
                status_type = status_details.get("type")
                if status_type not in VALID_CHECKIN_STATUS_TYPES:
                    raise ValueError(f"Invalid status type for check-in: {status_type}")
                
                # Update asset status if valid
                asset.status = status_id
                asset.save(update_fields=["status"])

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate cache
        cache.delete(f"assets:detail:{asset.id}")

        # Resolve ticket (optional, outside transaction)
        ticket_id = request.data.get("ticket_id")
        if ticket_id:
            try:
                resolve_ticket(ticket_id, asset_checkin_id=checkin.id)
            except Exception:
                pass

        return Response({"success": "Check-in, attachments, and status update completed successfully."}, status=status.HTTP_201_CREATED)

class ComponentViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = Component.objects.filter(is_deleted=False).order_by('name')
        if self.request.query_params.get('show_deleted') == 'true':
            queryset = Component.objects.filter(is_deleted=True).order_by('name')
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return ComponentListSerializer
        if self.action == "retrieve":
            return ComponentInstanceSerializer
        if self.action == "names":
            return ComponentNameSerializer
        return ComponentSerializer

    def _build_context_maps(self, components=None):
        """Build context maps for categories, manufacturers, suppliers, locations."""
        # categories
        category_map = cache.get("categories:map")
        if not category_map:
            categories = get_category_names()
            if isinstance(categories, list):
                category_map = {c['id']: c for c in categories}
            else:
                category_map = {}
            cache.set("categories:map", category_map, 300)

        # manufacturers
        manufacturer_map = cache.get("manufacturers:map")
        if not manufacturer_map:
            manufacturers = get_manufacturer_names()
            if isinstance(manufacturers, list):
                manufacturer_map = {m['id']: m for m in manufacturers}
            else:
                manufacturer_map = {}
            cache.set("manufacturers:map", manufacturer_map, 300)

        # suppliers
        supplier_map = cache.get("suppliers:map")
        if not supplier_map:
            suppliers = get_supplier_names()
            if isinstance(suppliers, list):
                supplier_map = {s['id']: s for s in suppliers}
            else:
                supplier_map = {}
            cache.set("suppliers:map", supplier_map, 300)

        # locations
        location_map = cache.get("locations:map")
        if not location_map:
            locations = get_locations_list()
            if isinstance(locations, list):
                location_map = {loc['id']: loc for loc in locations}
            elif isinstance(locations, dict) and 'results' in locations:
                location_map = {loc['id']: loc for loc in locations['results']}
            else:
                location_map = {}
            cache.set("locations:map", location_map, 300)

        return {
            'category_map': category_map,
            'manufacturer_map': manufacturer_map,
            'supplier_map': supplier_map,
            'location_map': location_map,
        }

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        context_maps = self._build_context_maps()
        serializer = self.get_serializer(queryset, many=True, context=context_maps)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        context_maps = self._build_context_maps()
        serializer = self.get_serializer(instance, context=context_maps)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """List all soft-deleted components"""
        components = Component.objects.filter(is_deleted=True).order_by('name')
        context_maps = self._build_context_maps()
        serializer = ComponentListSerializer(components, many=True, context=context_maps)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def recover(self, request, pk=None):
        """Recover a soft-deleted component"""
        try:
            component = Component.objects.get(pk=pk, is_deleted=True)
            component.is_deleted = False
            component.save()
            serializer = self.get_serializer(component)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Component.DoesNotExist:
            return Response(
                {"detail": "Component not found or already active."},
                status=status.HTTP_404_NOT_FOUND
            )

    def perform_destroy(self, instance):
        # Check if the component has an active checkout (no checkin yet)
        if instance.component_checkouts.filter(component_checkins__isnull=True).exists():
            raise ValidationError({ "detail": "Cannot delete this component, it's currently checked out." })

        # Otherwise, perform soft delete
        instance.is_deleted = True
        instance.save()

        # Log activity
        log_component_activity(
            action='Delete',
            component=instance,
            notes=f"Component '{instance.name}' deleted"
        )

    def perform_create(self, serializer):
        component = serializer.save()

        # Log activity
        log_component_activity(
            action='Create',
            component=component,
            notes=f"Component '{component.name}' created"
        )

    def perform_update(self, serializer):
        component = serializer.save()

        # Log activity
        log_component_activity(
            action='Update',
            component=component,
            notes=f"Component '{component.name}' updated"
        )

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk soft-delete components"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {"detail": "No IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if any component is currently checked out
        components = Component.objects.filter(id__in=ids, is_deleted=False)
        for component in components:
            if component.component_checkouts.filter(component_checkins__isnull=True).exists():
                return Response(
                    {"detail": f"Cannot delete component '{component.name}', it's currently checked out."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Perform soft delete
        deleted_count = 0
        for component in components:
            component.is_deleted = True
            component.save()
            log_component_activity(
                action='Delete',
                component=component,
                notes=f"Component '{component.name}' deleted (bulk)"
            )
            deleted_count += 1

        return Response(
            {"detail": f"Successfully deleted {deleted_count} component(s)."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['patch'], url_path='bulk-edit')
    def bulk_edit(self, request):
        """Bulk update components"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {"detail": "No IDs provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_data = {k: v for k, v in request.data.items() if k != 'ids' and v is not None and v != ''}
        if not update_data:
            return Response(
                {"detail": "No fields to update."},
                status=status.HTTP_400_BAD_REQUEST
            )

        components = Component.objects.filter(id__in=ids, is_deleted=False)
        updated_count = 0
        for component in components:
            for field, value in update_data.items():
                if hasattr(component, field):
                    setattr(component, field, value)
            component.save()
            log_component_activity(
                action='Update',
                component=component,
                notes=f"Component '{component.name}' updated (bulk)"
            )
            updated_count += 1

        return Response(
            {"detail": f"Successfully updated {updated_count} component(s)."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def names(self, request):
        """Get component names and images for bulk edit"""
        ids_param = request.query_params.get('ids', '')
        search = request.query_params.get('search', '')

        queryset = Component.objects.filter(is_deleted=False)

        if ids_param:
            ids = [int(id) for id in ids_param.split(',') if id.isdigit()]
            queryset = queryset.filter(id__in=ids)

        if search:
            queryset = queryset.filter(name__icontains=search)

        serializer = ComponentNameSerializer(queryset, many=True)
        return Response(serializer.data)

class ComponentCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckoutSerializer

    def get_queryset(self):
        # All checkouts ordered by date
        return ComponentCheckout.objects.select_related('component', 'asset').prefetch_related(
            'component_checkins'
        ).order_by('-checkout_date')

    def get_serializer_class(self):
        if self.action in ['list', 'active', 'by_component', 'by_asset']:
            return ComponentCheckoutListSerializer
        return ComponentCheckoutSerializer

    def perform_create(self, serializer):
        checkout = serializer.save()
        component = checkout.component

        # Log activity
        target_name = checkout.asset.name if checkout.asset else ''
        log_component_activity(
            action='Checkout',
            component=component,
            notes=f"Checked out {checkout.quantity} unit(s) of '{component.name}' to asset '{target_name}'"
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """List only active checkouts (not fully returned)"""
        all_checkouts = self.get_queryset()
        active_checkouts = [c for c in all_checkouts if not c.is_fully_returned]
        checkout_ids = [c.id for c in active_checkouts]
        queryset = ComponentCheckout.objects.filter(id__in=checkout_ids).select_related(
            'component', 'asset'
        ).prefetch_related('component_checkins').order_by('-checkout_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-component/(?P<component_id>[^/.]+)')
    def by_component(self, request, component_id=None):
        """List all checkouts for a specific component"""
        queryset = self.get_queryset().filter(component_id=component_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-asset/(?P<asset_id>[^/.]+)')
    def by_asset(self, request, asset_id=None):
        """List all checkouts to a specific asset"""
        queryset = self.get_queryset().filter(asset_id=asset_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ComponentCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckinSerializer

    def get_queryset(self):
        return ComponentCheckin.objects.select_related(
            'component_checkout',
            'component_checkout__component',
            'component_checkout__asset'
        ).order_by('-checkin_date')

    def get_serializer_class(self):
        if self.action == 'list':
            return ComponentCheckinListSerializer
        return ComponentCheckinSerializer

    def perform_create(self, serializer):
        checkin = serializer.save()
        checkout = checkin.component_checkout
        component = checkout.component

        # Log activity
        target_name = checkout.asset.name if checkout.asset else ''
        log_component_activity(
            action='Checkin',
            component=component,
            notes=f"Checked in {checkin.quantity} unit(s) of '{component.name}' from asset '{target_name}'"
        )

    @action(detail=False, methods=['get'], url_path='by-checkout/(?P<checkout_id>[^/.]+)')
    def by_checkout(self, request, checkout_id=None):
        """List all checkins for a specific checkout"""
        queryset = self.get_queryset().filter(component_checkout_id=checkout_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AuditScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = AuditScheduleSerializer

    def get_queryset(self):
        return AuditSchedule.objects.filter(is_deleted=False).order_by('date')

    def get_serializer_class(self):
        if self.action in ['list', 'scheduled', 'due', 'overdue']:
            return AuditScheduleListSerializer
        return AuditScheduleSerializer

    def _build_audit_schedule_context(self):
        """Build context maps for audit schedule serializers."""
        # Asset map
        asset_map = cache.get("assets:name:map")
        if not asset_map:
            assets = Asset.objects.filter(is_deleted=False).values('id', 'asset_id', 'name', 'image')
            asset_map = {a['id']: {'id': a['id'], 'asset_id': a['asset_id'], 'name': a['name'], 'image': a['image']} for a in assets}
            cache.set("assets:name:map", asset_map, 300)
        return {"asset_map": asset_map}

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        context = self._build_audit_schedule_context()
        serializer = self.get_serializer(queryset, many=True, context=context)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        # Check if the schedule already has an audit
        if hasattr(instance, 'audit') and instance.audit is not None and not instance.audit.is_deleted:
            raise ValidationError({
                "detail": "Cannot delete this audit schedule because it has already been audited."
            })

        # Otherwise, perform soft delete
        instance.is_deleted = True
        instance.save()

        # Log activity
        log_audit_activity(
            action='Delete',
            audit_or_schedule=instance,
            notes=f"Audit schedule deleted"
        )

    def perform_create(self, serializer):
        schedule = serializer.save()

        # Log activity
        log_audit_activity(
            action='Schedule',
            audit_or_schedule=schedule,
            notes=f"Audit scheduled for {schedule.date}"
        )

    def perform_update(self, serializer):
        schedule = serializer.save()

        # Log activity
        log_audit_activity(
            action='Update',
            audit_or_schedule=schedule,
            notes=f"Audit schedule updated"
        )

    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        """Future audits not yet completed"""
        today = localdate()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__gt=today,
            audit__isnull=True
        ).order_by('date')
        context = self._build_audit_schedule_context()
        serializer = self.get_serializer(qs, many=True, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def due(self, request):
        """Audits due to be audited (today and future), not yet completed"""
        today = localdate()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__gte=today,
            audit__isnull=True
        ).order_by('date')
        context = self._build_audit_schedule_context()
        serializer = self.get_serializer(qs, many=True, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Audits past due dates, not yet completed"""
        today = localdate()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__lt=today,
            audit__isnull=True
        ).order_by('date')
        context = self._build_audit_schedule_context()
        serializer = self.get_serializer(qs, many=True, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete audit schedules (only those without audits)."""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({"error": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        schedules = AuditSchedule.objects.filter(id__in=ids, is_deleted=False)
        deleted_ids = []
        errors = []

        for schedule in schedules:
            if hasattr(schedule, 'audit') and schedule.audit and not schedule.audit.is_deleted:
                errors.append(f"Schedule {schedule.id} has an audit and cannot be deleted.")
            else:
                schedule.is_deleted = True
                schedule.save()
                deleted_ids.append(schedule.id)
                log_audit_activity(action='Delete', audit_or_schedule=schedule, notes="Bulk deleted")

        return Response({
            "deleted": deleted_ids,
            "errors": errors
        }, status=status.HTTP_200_OK)

class AuditViewSet(viewsets.ModelViewSet):
    serializer_class = AuditSerializer

    def get_queryset(self):
        return Audit.objects.filter(is_deleted=False).select_related('audit_schedule').prefetch_related('audit_files').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return AuditListSerializer
        return AuditSerializer

    def _build_audit_context(self, audits):
        """Build context maps for audit list serializer."""
        # Get asset IDs from audit schedules
        asset_ids = set()
        location_ids = set()
        user_ids = set()

        for audit in audits:
            if audit.audit_schedule:
                asset_ids.add(audit.audit_schedule.asset_id)
            if audit.location:
                location_ids.add(audit.location)
            if audit.user_id:
                user_ids.add(audit.user_id)

        # Asset map
        asset_map = {}
        if asset_ids:
            assets = Asset.objects.filter(id__in=asset_ids, is_deleted=False).values('id', 'asset_id', 'name', 'image')
            asset_map = {a['id']: {'id': a['id'], 'asset_id': a['asset_id'], 'name': a['name'], 'image': a['image']} for a in assets}

        # Location map (from contexts service)
        location_map = {}
        if location_ids:
            locations = get_locations_names()
            if isinstance(locations, list):
                location_map = {loc['id']: {'id': loc['id'], 'name': loc.get('city', loc.get('name', ''))} for loc in locations if loc['id'] in location_ids}

        # User map (from auth service)
        user_map = {}
        if user_ids:
            users = get_user_names()
            user_map = {u['id']: u for u in users if u['id'] in user_ids}

        return {
            "asset_map": asset_map,
            "location_map": location_map,
            "user_map": user_map
        }

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        context = self._build_audit_context(queryset)
        serializer = self.get_serializer(queryset, many=True, context=context)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        print(f"Audit create request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Audit validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        audit = serializer.save()

        # Log activity - when an audit is created, it means the audit was completed
        log_audit_activity(
            action='Create',
            audit_or_schedule=audit,
            notes=f"Audit completed on {audit.audit_date}"
        )

    def perform_update(self, serializer):
        audit = serializer.save()

        # Log activity
        log_audit_activity(
            action='Update',
            audit_or_schedule=audit,
            notes=f"Audit updated"
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

        # Log activity
        log_audit_activity(
            action='Delete',
            audit_or_schedule=instance,
            notes=f"Audit deleted"
        )

class AuditFileViewSet(viewsets.ModelViewSet):
    serializer_class = AuditFileSerializer

    def get_queryset(self):
        return AuditFile.objects.filter(is_deleted=False)

class RepairViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        return Repair.objects.filter(is_deleted=False).order_by('name')

    def get_serializer_class(self):
        # 1. Repairs Table (list)
        if self.action == "list":
            return RepairListSerializer

        # 2. Repair View
        if self.action == "retrieve":
            return RepairInstanceSerializer
        
        # 3. Create, Update, Destroy
        return RepairSerializer

    def _build_repair_context_maps(self):
        # assets
        asset_map = cache.get("assets:map")
        if not asset_map:
            assets = Asset.objects.filter(is_deleted=False)
            serialized = AssetNameSerializer(assets, many=True).data
            asset_map = {a['id']: a for a in serialized}
            cache.set("assets:map", asset_map, 300)

        # suppliers
        supplier_map = cache.get("suppliers:map")
        if not supplier_map:
            suppliers = get_supplier_names()
            supplier_map = {s['id']: s for s in suppliers}
            cache.set("suppliers:map", supplier_map, 300)

        # statuses (repair category only)
        status_map = cache.get("statuses:repair:map")
        if not status_map:
            statuses = get_status_names_repairs()
            status_map = {s['id']: s for s in statuses}
            cache.set("statuses:repair:map", status_map, 300)

        return {
            "asset_map": asset_map,
            "supplier_map": supplier_map,
            "status_map": status_map,
        }

   # Helper function for cached responses
    def cached_response(self, cache_key, queryset, serializer_class, many=True, context=None):
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        context = context or {}
        serializer = serializer_class(queryset, many=many, context=context)
        cache.set(cache_key, serializer.data, 300)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        context_maps = self._build_repair_context_maps()
        return self.cached_response(
            "repairs:list",
            queryset,
            self.get_serializer_class(),
            many=True,
            context={**context_maps, 'request': request}
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        context_maps = self._build_repair_context_maps()
        cache_key = f"repairs:detail:{instance.id}"
        return self.cached_response(
            cache_key,
            instance,
            self.get_serializer_class(),
            many=False,
            context={**context_maps, 'request': request}
        )
    
    def invalidate_repair_cache(self, repair_id):
        cache.delete("repairs:list")
        cache.delete(f"repairs:detail:{repair_id}")

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
        self.invalidate_repair_cache(instance.id)

        # Log activity
        log_repair_activity(
            action='Delete',
            repair=instance,
            notes=f"Repair '{instance.name}' deleted"
        )

    def perform_create(self, serializer):
        repair = serializer.save()
        self.invalidate_repair_cache(repair.id)

        # Log activity
        log_repair_activity(
            action='Create',
            repair=repair,
            notes=f"Repair '{repair.name}' created"
        )

    def perform_update(self, serializer):
        repair = serializer.save()
        self.invalidate_repair_cache(repair.id)

        # Log activity
        log_repair_activity(
            action='Update',
            repair=repair,
            notes=f"Repair '{repair.name}' updated"
        )

    # Bulk delete
    @action(detail=False, methods=["post"], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Soft delete multiple repairs by IDs.
        Expects payload: { "ids": [1, 2, 3] }
        """
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        repairs = Repair.objects.filter(id__in=ids, is_deleted=False)
        deleted_count = 0

        for repair in repairs:
            repair.is_deleted = True
            repair.save()
            self.invalidate_repair_cache(repair.id)

            # Log activity
            log_repair_activity(
                action='Delete',
                repair=repair,
                notes=f"Repair '{repair.name}' deleted (bulk)"
            )
            deleted_count += 1

        return Response({
            "detail": f"{deleted_count} repair(s) deleted successfully."
        }, status=status.HTTP_200_OK)
# END REPAIR

#USAGE CHECK
@api_view(['GET'])
def check_supplier_usage(request, pk):
    """
    Check if supplier is referenced by any active asset, product, component, or repair.
    """
    in_use = (
        Asset.objects.filter(supplier=pk, is_deleted=False).exists()
        or Component.objects.filter(supplier=pk, is_deleted=False).exists()
        or Product.objects.filter(is_deleted=False).filter(
            manufacturer=pk
        ).exists()  # some products may use manufacturer ID equal to supplier if reused
        or Repair.objects.filter(supplier_id=pk, is_deleted=False).exists()
    )
    return Response({"in_use": in_use})


@api_view(['GET'])
def check_manufacturer_usage(request, pk):
    """
    Check if manufacturer is referenced by any active asset, product, or component.
    """
    in_use = (
        Asset.objects.filter(product__manufacturer=pk, is_deleted=False).exists()
        or Component.objects.filter(manufacturer=pk, is_deleted=False).exists()
        or Product.objects.filter(manufacturer=pk, is_deleted=False).exists()
    )
    return Response({"in_use": in_use})


@api_view(['GET'])
def check_depreciation_usage(request, pk):
    """
    Check if depreciation is referenced by any active product or asset.
    """
    in_use = (
        Product.objects.filter(depreciation=pk, is_deleted=False).exists()
        or Asset.objects.filter(product__depreciation=pk, is_deleted=False).exists()
    )
    return Response({"in_use": in_use})
#END
from .api.usage import check_bulk_usage


#DASHBOARD
class DashboardViewSet(viewsets.ViewSet):

    def list(self, request):
        """List available dashboard endpoints"""
        base_uri = request.build_absolute_uri()
        return Response({
            "available_endpoints": {
                "metrics": base_uri + "metrics/",
                "forecast_asset_status": base_uri + "forecast/asset-status/",
                "forecast_product_demand": base_uri + "forecast/product-demand/",
                "forecast_kpi_summary": base_uri + "forecast/kpi-summary/",
            }
        })
    # /dashboard/metrics
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        today = now().date()
        next_30_days = today + timedelta(days=30)

        # Assets due for return - only count checkouts that haven't been checked in yet
        due_for_return = AssetCheckout.objects.filter(
            return_date__gte=today,
            asset_checkin__isnull=True
        ).count()
        overdue_for_return = AssetCheckout.objects.filter(
            return_date__lt=today,
            asset_checkin__isnull=True
        ).count()

        # Audits - due (today and future), upcoming (next 30 days), overdue, and completed
        try:
            # Only consider audit schedules that are not deleted and not yet audited
            base_schedule_qs = AuditSchedule.objects.filter(
                is_deleted=False,
                audit__isnull=True
            )

            # Audits due to be audited: all pending audits from today onwards
            due_audits = base_schedule_qs.filter(
                date__gte=today,
            ).count()

            # Upcoming audits within the next 30 days
            upcoming_audits = base_schedule_qs.filter(
                date__gt=today,
                date__lte=next_30_days,
            ).count()

            # Overdue audits (past due date, not yet completed)
            overdue_audits = base_schedule_qs.filter(
                date__lt=today,
            ).count()

            # Completed audits (audit records not soft-deleted)
            completed_audits = Audit.objects.filter(is_deleted=False).count()
        except Exception:
            due_audits = 0
            upcoming_audits = 0
            overdue_audits = 0
            completed_audits = 0

        # End of life - products with end_of_life date
        try:
            reached_end_of_life = Product.objects.filter(
                end_of_life__lte=today,
                is_deleted=False
            ).count()
            upcoming_end_of_life = Product.objects.filter(
                end_of_life__gt=today,
                end_of_life__lte=next_30_days,
                is_deleted=False
            ).count()
        except:
            reached_end_of_life = 0
            upcoming_end_of_life = 0

        # Warranties
        expired_warranties = Asset.objects.filter(
            warranty_expiration__lte=today,
            is_deleted=False
        ).count()
        expiring_warranties = Asset.objects.filter(
            warranty_expiration__gt=today,
            warranty_expiration__lte=next_30_days,
            is_deleted=False
        ).count()

        # Low stock
        low_stock = Component.objects.filter(is_deleted=False).annotate(
            total_checked_out=Coalesce(Sum('component_checkouts__quantity'), Value(0)),
            total_checked_in=Coalesce(Sum('component_checkouts__component_checkins__quantity'), Value(0)),
            available_quantity=F('quantity') - (F('total_checked_out') - F('total_checked_in'))
        ).filter(
            available_quantity__lt=F('minimum_quantity')
        ).count()

        # Total asset costs
        total_asset_costs = Asset.objects.filter(is_deleted=False).aggregate(
            total=Coalesce(Sum('purchase_cost'), Value(0), output_field=DecimalField())
        )['total']

        # Asset utilization (% of assets that are deployed)
        total_assets = Asset.objects.filter(is_deleted=False).count()
        statuses = get_status_names_assets()
        deployed_status_ids = [s['id'] for s in statuses if s.get('type') == 'deployed'] if isinstance(statuses, list) else []
        deployed_count = Asset.objects.filter(
            is_deleted=False,
            status__in=deployed_status_ids
        ).count() if deployed_status_ids else 0
        asset_utilization = round((deployed_count / total_assets * 100) if total_assets > 0 else 0)

        # Asset categories - count by category
        categories = get_categories_list(type='asset', limit=100)
        category_map = {c['id']: c['name'] for c in categories} if isinstance(categories, list) else {}
        category_counts = Asset.objects.filter(is_deleted=False).values(
            'product__category'
        ).annotate(count=Count('id')).order_by('-count')
        asset_categories = [
            {
                'product__category__name': category_map.get(item['product__category'], f"Category {item['product__category']}"),
                'count': item['count']
            }
            for item in category_counts if item['product__category']
        ]

        # Asset statuses - count by status
        status_map = {s['id']: s['name'] for s in statuses} if isinstance(statuses, list) else {}
        status_counts = Asset.objects.filter(is_deleted=False).values(
            'status'
        ).annotate(count=Count('id')).order_by('-count')
        asset_statuses = [
            {
                'status__name': status_map.get(item['status'], f"Status {item['status']}"),
                'count': item['count']
            }
            for item in status_counts if item['status']
        ]

        data = {
            "due_for_return": due_for_return,
            "overdue_for_return": overdue_for_return,
            "due_audits": due_audits,
            "upcoming_audits": upcoming_audits,
            "overdue_audits": overdue_audits,
            "completed_audits": completed_audits,
            "reached_end_of_life": reached_end_of_life,
            "upcoming_end_of_life": upcoming_end_of_life,
            "expired_warranties": expired_warranties,
            "expiring_warranties": expiring_warranties,
            "low_stock": low_stock,
            "total_asset_costs": total_asset_costs,
            "asset_utilization": asset_utilization,
            "asset_categories": asset_categories,
            "asset_statuses": asset_statuses,
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)

    # /dashboard/forecast/asset-status/
    @action(detail=False, methods=['get'], url_path='forecast/asset-status')
    def forecast_asset_status(self, request):
        """
        Get asset status forecast data.
        Returns historical and forecasted counts by status type (available, checked-out, under repair).

        Query params:
        - months_back: Number of historical months (default: 6)
        - months_forward: Number of forecast months (default: 3)
        """
        from assets_ms.services.forecast import get_asset_status_forecast

        months_back = int(request.query_params.get('months_back', 6))
        months_forward = int(request.query_params.get('months_forward', 3))

        try:
            data = get_asset_status_forecast(months_back=months_back, months_forward=months_forward)
            return Response(data)
        except Exception as e:
            return Response(
                {"error": f"Failed to generate asset status forecast: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # /dashboard/forecast/product-demand/
    @action(detail=False, methods=['get'], url_path='forecast/product-demand')
    def forecast_product_demand(self, request):
        """
        Get product demand forecast data.
        Returns historical and forecasted checkout demand per product model.

        Query params:
        - months_back: Number of historical months (default: 6)
        - months_forward: Number of forecast months (default: 3)
        - top_n: Number of top products to include (default: 4)
        """
        from assets_ms.services.forecast import get_product_demand_forecast

        months_back = int(request.query_params.get('months_back', 6))
        months_forward = int(request.query_params.get('months_forward', 3))
        top_n = int(request.query_params.get('top_n', 4))

        try:
            data = get_product_demand_forecast(
                months_back=months_back,
                months_forward=months_forward,
                top_n=top_n
            )
            return Response(data)
        except Exception as e:
            return Response(
                {"error": f"Failed to generate product demand forecast: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # /dashboard/forecast/kpi-summary/
    @action(detail=False, methods=['get'], url_path='forecast/kpi-summary')
    def forecast_kpi_summary(self, request):
        """
        Get KPI summary data for forecast insights.
        Returns key performance indicators including forecasted demand, most requested model,
        shortage risk, and predicted asset count changes.
        """
        from assets_ms.services.forecast import get_kpi_summary

        try:
            data = get_kpi_summary()
            return Response(data)
        except Exception as e:
            return Response(
                {"error": f"Failed to generate KPI summary: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ASSET REPORT TEMPLATES
class AssetReportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for CRUD operations on AssetReportTemplate."""
    serializer_class = AssetReportTemplateSerializer

    def get_queryset(self):
        """Return non-deleted templates, optionally filtered by user_id."""
        queryset = AssetReportTemplate.objects.filter(is_deleted=False)
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset.order_by('-created_at')

    def perform_destroy(self, instance):
        """Soft delete the template."""
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['get'])
    def my_templates(self, request):
        """List templates for a specific user (via query param user_id)."""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        templates = AssetReportTemplate.objects.filter(
            user_id=user_id,
            is_deleted=False
        ).order_by('-created_at')
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)
