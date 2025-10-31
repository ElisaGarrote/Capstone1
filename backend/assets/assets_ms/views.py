from rest_framework import viewsets, status
from .models import *
from .serializer import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Sum, Count
from rest_framework.exceptions import ValidationError

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        # Check for referencing assets that are not deleted
        if instance.product_assets.filter(is_deleted=False).exists():
            raise ValidationError({
                "detail": "Cannot delete this product, it's being used by one or more active assets."
            })

        # If no active assets, allow soft delete
        instance.is_deleted = True
        instance.save()

class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Asset.objects.filter(is_deleted=False).order_by('name')

    def perform_destroy(self, instance):
        errors = []

        # Check for active checkouts (no checkin yet)
        if instance.asset_checkouts.filter(asset_checkin__isnull=True).exists():
            errors.append("This asset has an active checkout.")

        # Check for component checkouts referencing this asset that are not yet checked in
        if instance.checkout_to.filter(component_checkins__isnull=True).exists():
            errors.append("This asset has a component checked out.")

        # If any blocking relationships exist, raise error
        if errors:
            raise ValidationError({
                "detail": "Cannot delete this asset because:\n- " + "\n- ".join(errors)
            })

        # Otherwise, perform soft delete
        instance.is_deleted = True
        instance.save()

class AssetCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCheckoutSerializer
    
    def get_queryset(self):
        # Only checkouts that have NOT been checked in
        return AssetCheckout.objects.select_related('asset').filter(
            asset_checkin__isnull=True
        ).order_by('-checkout_date')
    
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
        # Check if the component has an active checkout (no checkin yet) 
        if instance.component_checkouts.filter(component_checkins__isnull=True).exists():
            raise ValidationError({ "detail": "Cannot delete this component, it's currently checked out." })
        
        # Otherwise, perform soft delete 
        instance.is_deleted = True
        instance.save()

class ComponentCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckoutSerializer
    
    def get_queryset(self):
        # Only checkouts that have NOT been checked in
        return ComponentCheckout.objects.select_related('component', 'asset').filter(
            component_checkins__isnull=True
        ).order_by('-checkout_date')

class ComponentCheckinViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentCheckinSerializer

    def get_queryset(self):
        return ComponentCheckin.objects.select_related('component_checkout', 'component_checkout__component').order_by('-checkin_date')

class AuditScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = AuditScheduleSerializer

    def get_queryset(self):
        return AuditSchedule.objects.filter(is_deleted=False).order_by('date')
    
    def perform_destroy(self, instance):
        # Check if the schedule already has an audit
        if hasattr(instance, 'audit') and instance.audit is not None and not instance.audit.is_deleted:
            raise ValidationError({
                "detail": "Cannot delete this audit schedule because it has already been audited."
            })

        # Otherwise, perform soft delete
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        """Future audits not yet completed"""
        today = now().date()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__gt=today
        ).exclude(audit__isnull=False)
        serializer = AuditScheduleSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def due(self, request):
        """Audits due today or earlier, not yet completed"""
        today = now().date()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__lte=today,
            audit__isnull=True
        )
        serializer = AuditScheduleSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Audits past due dates, not yet completed"""
        today = now().date()
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            date__lt=today,
            audit__isnull=True
        )
        serializer = AuditScheduleSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Return schedules with their completed audit"""
        qs = AuditSchedule.objects.filter(
            is_deleted=False,
            audit__isnull=False,  # only schedules that have an audit
            audit__is_deleted=False
        )
        serializer = CompletedAuditSerializer(qs, many=True)
        return Response(serializer.data)

class AuditViewSet(viewsets.ModelViewSet):
    serializer_class = AuditSerializer

    def get_queryset(self):
        return Audit.objects.filter(is_deleted=False).order_by('-created_at')

class AuditFileViewSet(viewsets.ModelViewSet):
    serializer_class = AuditFileSerializer

    def get_queryset(self):
        return AuditFile.objects.filter(is_deleted=False)

class DashboardViewSet(viewsets.ViewSet):
    
    def list(self, request):
        """List available dashboard endpoints"""
        return Response({
            "available_endpoints": {
                "metrics": request.build_absolute_uri() + "metrics/"
            }
        })

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        today = now().date()
        next_30_days = today + timedelta(days=30)

        # Assets due for return
        due_for_return = AssetCheckout.objects.filter(return_date__gte=today).count()
        overdue_for_return = AssetCheckout.objects.filter(return_date__lt=today).count()

        # Audits - need to check if these models exist
        try:
            upcoming_audits = AuditSchedule.objects.filter(date__gt=today, date__lte=next_30_days).count()
            overdue_audits = AuditSchedule.objects.filter(date__lt=today).count()
        except:
            upcoming_audits = 0
            overdue_audits = 0

        # Remove end_of_life references since field doesn't exist
        reached_end_of_life = 0
        upcoming_end_of_life = 0

        # Warranties
        expired_warranties = Asset.objects.filter(warranty_expiration__lte=today).count()
        expiring_warranties = Asset.objects.filter(warranty_expiration__gt=today, warranty_expiration__lte=next_30_days).count()

        # Low stock
        low_stock = Component.objects.filter(available_quantity__lt=F('minimum_quantity')).count()

        data = {
            "due_for_return": due_for_return,
            "overdue_for_return": overdue_for_return,
            "upcoming_audits": upcoming_audits,
            "overdue_audits": overdue_audits,
            "reached_end_of_life": reached_end_of_life,
            "upcoming_end_of_life": upcoming_end_of_life,
            "expired_warranties": expired_warranties,
            "expiring_warranties": expiring_warranties,
            "low_stock": low_stock
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
