from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from io import BytesIO
import datetime
import re
import os
import logging
import secrets
from django.conf import settings
from ..utils import normalize_name_smart
from ..serializer import *
from ..models import *
from ..serializer import *
from ..models import *

"""Import / Export API endpoints for common resources.

Placed under contexts_ms.api so we don't bloat the main views file.
Each resource gets two endpoints: POST /import/<resource>/ and GET /export/<resource>/

Implementation notes:
- Imports openpyxl lazily inside each handler to avoid crashing at module import time
  if the package wasn't installed yet during image build.
- Uses the app's existing serializers for validation and persistence.
 # NOTE (future improvement): To improve security / auditing, consider changing the
- filename to include a short, single-use token or an export id so the file can be
- traced back to the requesting user/action. Example format: "{sheet}_{date}_{token}.xlsx".
- The token should be generated server-side, stored briefly (or logged), and tied to the
- authenticated user/action. Do not include sensitive info in filenames. When auth is
- available, use it to authorize the export and associate the token with the user.
"""

def _normalize_header_to_field(header: str):
    if not header:
        return ''
    key = re.sub(r'[^0-9a-zA-Z]+', '_', str(header)).strip('_').lower()
    mapping = {
        # supplier
        'contactname': 'contact_name',
        'contact_name': 'contact_name',
        'contact': 'contact_name',
        'phonenumber': 'phone_number',
        'phone': 'phone_number',
        'phone_number': 'phone_number',
        'url': 'url',
        'website': 'url',
        'email': 'email',
        'name': 'name',
        'address': 'address',
        'city': 'city',
        'zip': 'zip',
        'notes': 'notes',
        'duration': 'duration',
        'minimumvalue': 'minimum_value',
        'minimum_value': 'minimum_value',
        'createdat': 'created_at',
        'created_at': 'created_at',
        'updatedat': 'updated_at',
        'updated_at': 'updated_at',
        # manufacturer
        'manuurl': 'manu_url',
        'supporturl': 'support_url',
        'supportphone': 'support_phone',
        'supportemail': 'support_email',
        # status
        'statustype': 'type',
    }
    return mapping.get(key, key)


class _BaseImportAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    serializer_class = None  # override
    model = None
    # Maximum upload file size (5 MB)
    max_upload_size = 5 * 1024 * 1024
    allowed_content_types = (
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
    )

    def _find_instance_by_natural_key(self, data: dict):
        """Try to locate an existing instance using a natural key for this model.

        - Category: match name (case-insensitive) and type
        - Supplier / Manufacturer: match name (case-insensitive)
        - Depreciation / Status: match name (case-insensitive)

        Returns the instance or None.
        """
        name = data.get('name') if isinstance(data, dict) else None
        if name:
            name = str(name).strip()

        try:
            if self.model is Category:
                type_val = data.get('type') if isinstance(data, dict) else None
                if not name:
                    return None
                return Category.objects.filter(name__iexact=name, type=type_val, is_deleted=False).first()

            if self.model in (Supplier, Manufacturer):
                if not name:
                    return None
                return self.model.objects.filter(name__iexact=name, is_deleted=False).first()

            if self.model in (Depreciation, Status):
                if not name:
                    return None
                return self.model.objects.filter(name__iexact=name, is_deleted=False).first()
        except Exception:
            return None

        return None

    def post(self, request, format=None):
        # Lazy import openpyxl to avoid ModuleNotFoundError at import time
        try:
            import openpyxl  # type: ignore
        except Exception:
            # Provide actionable instructions so developers know how to fix the runtime
            return Response({
                'detail': 'openpyxl is not installed in the running Python environment.',
                'install_instructions': (
                    'Add openpyxl to backend/contexts/requirements.txt and rebuild the contexts image,\n'
                    'for example: docker-compose -f docker-compose.dev.yml build --no-cache contexts && '
                    'docker-compose -f docker-compose.dev.yml up -d contexts'
                )
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        uploaded = request.FILES.get('file')
        if not uploaded:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Basic file checks: size and content type
        if hasattr(uploaded, 'size') and uploaded.size and uploaded.size > self.max_upload_size:
            return Response({'detail': f'Uploaded file is too large. Max size is {self.max_upload_size} bytes.'}, status=status.HTTP_400_BAD_REQUEST)

        # Content type / filename check (may be unreliable across clients)
        content_type = getattr(uploaded, 'content_type', '')
        filename = getattr(uploaded, 'name', '')
        if content_type and content_type not in self.allowed_content_types and not filename.lower().endswith('.xlsx'):
            return Response({'detail': 'Uploaded file must be an XLSX file.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wb = openpyxl.load_workbook(uploaded, data_only=True)
        except Exception as e:
            return Response({'detail': f'Failed to read workbook: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        sheet = wb.active
        rows = list(sheet.rows)
        if not rows or len(rows) < 2:
            return Response({'detail': 'Workbook must have a header row and at least one data row.'}, status=status.HTTP_400_BAD_REQUEST)

        header_cells = [cell.value for cell in rows[0]]
        headers = [str(h).strip() if h is not None else '' for h in header_cells]

        created = 0
        updated = 0
        errors = []

        # Track normalized names created or updated within this import run so
        # subsequent rows in the same upload don't fail uniqueness checks.
        seen_names = set()

        Serializer = self.serializer_class

        # allow_update must be explicitly provided as a form field or query param to enable updates
        allow_update_raw = request.data.get('allow_update') if isinstance(request.data, dict) else None
        if allow_update_raw is None:
            allow_update_raw = request.query_params.get('allow_update')
        allow_update = str(allow_update_raw).lower() in ('1', 'true', 'yes') if allow_update_raw is not None else False

        # If updates are requested, require a valid API key header to allow them.
        # This is a lightweight guard until full auth is implemented.
        if allow_update:
            expected_key = getattr(settings, 'IMPORT_API_KEY', None) or os.environ.get('IMPORT_API_KEY')
            # If the server hasn't set an import key, disallow updates by default (safe-fail)
            if not expected_key:
                return Response({'detail': 'Import updates are disabled on this server (no IMPORT_API_KEY configured).'}, status=status.HTTP_403_FORBIDDEN)
            # Header name: X-IMPORT-API-KEY (HTTP_X_IMPORT_API_KEY in request.META)
            provided = request.META.get('HTTP_X_IMPORT_API_KEY') or request.headers.get('X-IMPORT-API-KEY')
            if not provided or provided != expected_key:
                return Response({'detail': 'Invalid or missing API key. Updates require a valid X-IMPORT-API-KEY header.'}, status=status.HTTP_403_FORBIDDEN)

        # Which upsert strategy to use when updates are allowed: 'id' (default) or 'natural'
        upsert_by = request.data.get('upsert_by') if isinstance(request.data, dict) else None
        if not upsert_by:
            upsert_by = request.query_params.get('upsert_by')
        upsert_by = str(upsert_by).lower() if upsert_by else 'id'

        # small logger for import/export audit entries
        logger = logging.getLogger('import_export')

        # Use transaction behavior at serializer.save level if required by project settings
        for idx, row in enumerate(rows[1:], start=2):
            values = [cell.value for cell in row]
            data = {}
            row_id = None
            for h, v in zip(headers, values):
                if not h:
                    continue
                key = _normalize_header_to_field(h)
                # Never allow client to set timestamps via import
                if key in ('created_at', 'updated_at'):
                    continue
                # Capture id if present; only use it when allow_update is True
                if key in ('id', 'pk'):
                    row_id = v
                    continue
                data[key] = v

            # Log incoming row data for debugging
            try:
                logger.info('import_row %s data=%s', idx, data)
            except Exception:
                pass

            # If updates are allowed, attempt upsert according to strategy
            instance = None
            if allow_update:
                if upsert_by == 'id' and row_id:
                    try:
                        instance = self.model.objects.filter(pk=row_id).first()
                    except Exception:
                        instance = None
                elif upsert_by == 'natural':
                    # Try to find instance by natural key for this model
                    try:
                        instance = self._find_instance_by_natural_key(data)
                    except Exception:
                        instance = None

            if instance is not None:
                # pass seen_names into serializer context so its uniqueness
                # validation can be aware of same-run creations
                serializer = Serializer(instance=instance, data=data, partial=True, context={'import_seen_names': seen_names})
                if serializer.is_valid():
                    try:
                        serializer.save()
                        updated += 1
                        # Audit log: short token and request IP to aid tracing
                        try:
                            token = secrets.token_hex(4)
                            xff = request.META.get('HTTP_X_FORWARDED_FOR')
                            ip = xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')
                            logger.info(
                                'import_update: model=%s id=%s row=%s ip=%s token=%s',
                                self.model.__name__, getattr(instance, 'pk', None), idx, ip, token
                            )
                        except Exception:
                            # don't let logging break the import
                            pass
                        # record updated name so subsequent rows won't conflict
                        try:
                            nm = data.get('name')
                            if nm:
                                seen_names.add(normalize_name_smart(nm))
                        except Exception:
                            pass
                        continue
                    except Exception as e:
                        errors.append({'row': idx, 'errors': str(e)})
                else:
                    # log validation issues to aid debugging
                    try:
                        logger.warning('import row %s update validation errors: %s', idx, serializer.errors)
                    except Exception:
                        pass
                    # If the update failed due to a uniqueness conflict on name,
                    # and updates are explicitly allowed, attempt to resolve by
                    # soft-deleting any conflicting records (this is an import
                    # convenience because the import may re-create/merge data).
                    try:
                        err = serializer.errors or {}
                        if 'name' in err and allow_update and upsert_by == 'id' and data.get('name'):
                            target_name = normalize_name_smart(data.get('name'))
                            conflicts = self.model.objects.filter(name__iexact=target_name, is_deleted=False).exclude(pk=instance.pk)
                            if conflicts.exists():
                                for c in conflicts:
                                    # prefer soft-delete if the model supports it
                                    try:
                                        c.is_deleted = True
                                        c.save()
                                    except Exception:
                                        try:
                                            c.delete()
                                        except Exception:
                                            pass
                                # retry the update after removing conflicts
                                serializer = Serializer(instance=instance, data=data, partial=True, context={'import_seen_names': seen_names})
                                if serializer.is_valid():
                                    try:
                                        serializer.save()
                                        updated += 1
                                        try:
                                            nm = data.get('name')
                                            if nm:
                                                seen_names.add(normalize_name_smart(nm))
                                        except Exception:
                                            pass
                                        continue
                                    except Exception as e:
                                        errors.append({'row': idx, 'errors': str(e)})
                    except Exception:
                        pass
                    errors.append({'row': idx, 'errors': serializer.errors})

            # Otherwise create a new instance
            # Create flow: include seen_names in serializer context so validation
            # may skip uniqueness checks for names already created in this run.
            serializer = Serializer(data=data, context={'import_seen_names': seen_names})
            if serializer.is_valid():
                try:
                    serializer.save()
                    created += 1
                    # remember created name for this run
                    try:
                        nm = data.get('name')
                        if nm:
                            seen_names.add(normalize_name_smart(nm))
                    except Exception:
                        pass
                except Exception as e:
                    errors.append({'row': idx, 'errors': str(e)})
            else:
                try:
                    logger.warning('import row %s create validation errors: %s', idx, serializer.errors)
                except Exception:
                    pass
                errors.append({'row': idx, 'errors': serializer.errors})

        try:
            logger.info('import_summary created=%s updated=%s errors=%s', created, updated, errors)
        except Exception:
            pass
        return Response({'created': created, 'updated': updated, 'errors': errors}, status=status.HTTP_200_OK)


class _BaseExportAPIView(APIView):
    serializer_class = None
    queryset = None
    sheet_name = 'Sheet1'
    # Fields to include in export; override per-resource when needed.
    export_fields = None

    def get(self, request, format=None):
        # Lazy import openpyxl
        try:
            import openpyxl  # type: ignore
        except Exception:
            return Response({
                'detail': 'openpyxl is not installed in the running Python environment.',
                'install_instructions': (
                    'Add openpyxl to backend/contexts/requirements.txt and rebuild the contexts image,\n'
                    'for example: docker-compose -f docker-compose.dev.yml build --no-cache contexts && '
                    'docker-compose -f docker-compose.dev.yml up -d contexts'
                )
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        qs = self.queryset()
        serializer = self.serializer_class(qs, many=True)
        data = serializer.data

        # Determine fields to export (exclude id and internal fields)
        if self.export_fields is not None:
            headers = list(self.export_fields)
        else:
            # derive from serializer fields but exclude 'id' and 'is_deleted'
            if data:
                headers = [h for h in list(data[0].keys()) if h not in ('id', 'is_deleted')]
            else:
                headers = []

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = self.sheet_name

        if data and headers:
            ws.append(headers)
            for item in data:
                row = [item.get(h) for h in headers]
                ws.append(row)
        else:
            # If there is no data or no headers, write a helpful message
            ws.append(['No Data'])

        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)

        filename = f"{self.sheet_name.lower()}_{datetime.date.today().isoformat()}.xlsx"
        # NOTE (future improvement): To improve security / auditing, read notes above

        response = HttpResponse(bio.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# Suppliers
class SupplierImportAPIView(_BaseImportAPIView):
    serializer_class = SupplierSerializer
    model = Supplier


class SupplierExportAPIView(_BaseExportAPIView):
    serializer_class = SupplierSerializer
    queryset = staticmethod(lambda: Supplier.objects.filter(is_deleted=False).order_by('name'))
    sheet_name = 'Suppliers'
    export_fields = [
        'name', 'address', 'city', 'zip', 'contact_name', 'phone_number', 'email', 'url', 'notes', 'created_at', 'updated_at'
    ]

#Put views here for easy navigation
# Categories
class CategoryImportAPIView(_BaseImportAPIView):
    serializer_class = CategorySerializer
    model = Category


class CategoryExportAPIView(_BaseExportAPIView):
    serializer_class = CategorySerializer
    queryset = staticmethod(lambda: Category.objects.filter(is_deleted=False).order_by('name'))
    sheet_name = 'Categories'
    export_fields = [
        'name', 'type', 'type_display', 'notes', 'created_at', 'updated_at'
    ]


# Depreciations
class DepreciationImportAPIView(_BaseImportAPIView):
    serializer_class = DepreciationSerializer
    model = Depreciation


class DepreciationExportAPIView(_BaseExportAPIView):
    serializer_class = DepreciationSerializer
    queryset = staticmethod(lambda: Depreciation.objects.filter(is_deleted=False).order_by('name'))
    sheet_name = 'Depreciations'
    export_fields = [
        'name', 'duration', 'minimum_value', 'created_at', 'updated_at'
    ]

# Manufacturers
class ManufacturerImportAPIView(_BaseImportAPIView):
    serializer_class = ManufacturerSerializer
    model = Manufacturer


class ManufacturerExportAPIView(_BaseExportAPIView):
    serializer_class = ManufacturerSerializer
    queryset = staticmethod(lambda: Manufacturer.objects.filter(is_deleted=False).order_by('name'))
    sheet_name = 'Manufacturers'
    export_fields = [
        'name', 'manu_url', 'support_url', 'support_phone', 'support_email', 'notes', 'created_at', 'updated_at'
    ]

# Status
class StatusImportAPIView(_BaseImportAPIView):
    serializer_class = StatusSerializer
    model = Status


class StatusExportAPIView(_BaseExportAPIView):
    serializer_class = StatusSerializer
    queryset = staticmethod(lambda: Status.objects.filter(is_deleted=False).order_by('name'))
    sheet_name = 'Statuses'
    export_fields = [
        'name', 'type', 'notes', 'created_at', 'updated_at'
    ]
