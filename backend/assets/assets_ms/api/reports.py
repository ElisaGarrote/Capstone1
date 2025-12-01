from io import BytesIO
import datetime
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.depreciation_report import generate_depreciation_report
from ..services.asset_report import generate_asset_report

# No ticket resolution here — report will only include status fields per request


class DepreciationReportAPIView(APIView):
    """Return depreciation report as XLSX (default) or JSON.

    Query params:
      - depreciation_id: int to filter by a specific depreciation record
      - format=xlsx (default) to download an XLSX file
      - format=json to return JSON results
    """

    def get(self, request):
        dep = request.query_params.get('depreciation_id')
        fmt = request.query_params.get('format', '').lower()

        try:
            dep_id = int(dep) if dep is not None else None
        except ValueError:
            return Response({"detail": "Invalid depreciation_id"}, status=status.HTTP_400_BAD_REQUEST)

        rows = generate_depreciation_report(depreciation_id=dep_id)

        # Explicit JSON request returns JSON (backwards compatible)
        if fmt == 'json':
            return Response({'results': rows})

        # CSV not supported for this report; prefer XLSX
        if fmt == 'csv':
            return Response({'detail': 'CSV export is not supported. Use format=xlsx or omit format to download an XLSX file.'}, status=status.HTTP_400_BAD_REQUEST)

        # Default: produce XLSX. Lazy import openpyxl and provide install guidance if missing.
        try:
            import openpyxl  # type: ignore
            from openpyxl.workbook import Workbook  # type: ignore
        except Exception:
            return Response({
                'detail': 'openpyxl is not installed in the running Python environment.',
                'install_instructions': (
                    'Add openpyxl to backend/assets/requirements.txt and rebuild the assets image,\n'
                    'for example: docker-compose -f docker-compose.dev.yml build --no-cache assets && '
                    'docker-compose -f docker-compose.dev.yml up -d assets'
                )
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        fieldnames = [
            'assetId', 'product', 'statusName', 'depreciationName', 'duration',
            'currency', 'minimumValue', 'purchaseCost', 'currentValue', 'depreciated',
            'monthlyDepreciation', 'monthsLeft'
        ]

        wb = Workbook()
        ws = wb.active
        ws.title = 'DepreciationReport'

        # Header
        ws.append(fieldnames)

        for r in rows:
            row = []
            for f in fieldnames:
                v = r.get(f, '')
                if isinstance(v, float):
                    # monthlyDepreciation keep more precision
                    if f == 'monthlyDepreciation':
                        row.append(round(v, 6))
                    else:
                        row.append(round(v, 2))
                else:
                    row.append(v)
            ws.append(row)

        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)

        filename = f"depreciation_report_{datetime.date.today().isoformat()}.xlsx"
        response = HttpResponse(bio.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class AssetReportAPIView(APIView):
    """Return asset report as XLSX (default) or JSON.

    Query params:
      - status_id: int to filter by a specific status
      - category_id: int to filter by a specific category
      - supplier_id: int to filter by a specific supplier
      - location_id: int to filter by a specific location
      - format=xlsx (default) to download an XLSX file
      - format=json to return JSON results
    """

    def get(self, request):
        # Parse filter parameters
        status_id = request.query_params.get('status_id')
        category_id = request.query_params.get('category_id')
        supplier_id = request.query_params.get('supplier_id')
        location_id = request.query_params.get('location_id')
        fmt = request.query_params.get('format', '').lower()

        # Validate and convert filter IDs
        try:
            status_id = int(status_id) if status_id else None
            category_id = int(category_id) if category_id else None
            supplier_id = int(supplier_id) if supplier_id else None
            location_id = int(location_id) if location_id else None
        except ValueError:
            return Response({"detail": "Invalid filter parameter. IDs must be integers."}, status=status.HTTP_400_BAD_REQUEST)

        rows = generate_asset_report(
            status_id=status_id,
            category_id=category_id,
            supplier_id=supplier_id,
            location_id=location_id,
        )

        # JSON format
        if fmt == 'json':
            return Response({'results': rows, 'count': len(rows)})

        # CSV not supported
        if fmt == 'csv':
            return Response({'detail': 'CSV export is not supported. Use format=xlsx or omit format to download an XLSX file.'}, status=status.HTTP_400_BAD_REQUEST)

        # Default: XLSX export
        try:
            from openpyxl.workbook import Workbook
        except ImportError:
            return Response({
                'detail': 'openpyxl is not installed in the running Python environment.',
                'install_instructions': (
                    'Add openpyxl to backend/assets/requirements.txt and rebuild the assets image.'
                )
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        fieldnames = [
            'assetId', 'name', 'product', 'category', 'statusName', 'supplier',
            'manufacturer', 'location', 'serialNumber', 'orderNumber',
            'purchaseDate', 'purchaseCost', 'warrantyExpiration', 'notes'
        ]

        wb = Workbook()
        ws = wb.active
        ws.title = 'AssetReport'

        # Header row
        ws.append(fieldnames)

        for r in rows:
            row = []
            for f in fieldnames:
                v = r.get(f, '')
                if isinstance(v, float):
                    row.append(round(v, 2))
                else:
                    row.append(v)
            ws.append(row)

        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)

        filename = f"asset_report_{datetime.date.today().isoformat()}.xlsx"
        response = HttpResponse(bio.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
