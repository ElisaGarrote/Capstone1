from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..services.contexts import (
    get_category_by_id,
    get_manufacturer_by_id,
    get_depreciation_by_id,
)

from ..services.contexts import get_suppliers, get_supplier_by_id


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


class CategoryDetailProxy(APIView):
    """Proxy endpoint to fetch a single category by ID from Contexts API."""
    def get(self, request, pk):
        category = get_category_by_id(pk)
        if category is None:
            return Response({"detail": "Category not found or external service unavailable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(category)


class ManufacturerDetailProxy(APIView):
    """Proxy endpoint to fetch a single manufacturer by ID from Contexts API."""
    def get(self, request, pk):
        manufacturer = get_manufacturer_by_id(pk)
        if manufacturer is None:
            return Response({"detail": "Manufacturer not found or external service unavailable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(manufacturer)


class DepreciationDetailProxy(APIView):
    """Proxy endpoint to fetch a single depreciation by ID from Contexts API."""
    def get(self, request, pk):
        depreciation = get_depreciation_by_id(pk)
        if depreciation is None:
            return Response({"detail": "Depreciation not found or external service unavailable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(depreciation)
