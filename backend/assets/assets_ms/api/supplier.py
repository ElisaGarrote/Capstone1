from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.supplier import get_suppliers, get_supplier_by_id

class SupplierListProxy(APIView):
    """Proxy endpoint to fetch supplier list from Contexts API."""
    def get(self, request):
        suppliers = get_suppliers()
        if suppliers is None:
            return Response({"detail": "Unable to fetch suppliers."}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(suppliers)

class SupplierDetailProxy(APIView):
    """Proxy endpoint to fetch a single supplier by ID."""
    def get(self, request, pk):
        supplier = get_supplier_by_id(pk)
        if supplier is None:
            return Response({"detail": "Supplier not found or external service unavailable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(supplier)
