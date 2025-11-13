from io import BytesIO
import datetime
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.depreciation_report import generate_depreciation_report

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
