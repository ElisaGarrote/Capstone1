from rest_framework import viewsets
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Asset.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class AssetCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCheckoutSerializer

    def get_queryset(self):
        return AssetCheckout.objects.select_related('asset').order_by('-checkout_date')


class AssetCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCheckinSerializer

    def get_queryset(self):
        return AssetCheckin.objects.select_related('asset_checkout', 'asset_checkout__asset').order_by('-checkin_date')

class ComponentViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Component.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class ComponentCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckoutSerializer

    def get_queryset(self):
        return ComponentCheckout.objects.select_related('component', 'asset').order_by('-checkout_date')


class ComponentCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckinSerializer

    def get_queryset(self):
        return ComponentCheckin.objects.select_related('component_checkout', 'component_checkout__component').order_by('-checkin_date')
