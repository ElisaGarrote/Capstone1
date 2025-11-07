from django.db import models
from django.core.exceptions import ValidationError
from .utils import normalize_name_smart

# Create your models here.
class Category(models.Model):
    class CategoryType(models.TextChoices):
        ASSET = 'asset', 'Asset'
        COMPONENT = 'component', 'Component'
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=9, choices=CategoryType.choices)
    logo = models.ImageField(upload_to='category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def clean(self):
        if self.name:
            # Use smart normalizer to preserve acronyms/possessives (e.g. "SSD's")
            self.name = normalize_name_smart(self.name)

        if Category.objects.filter(
            name__iexact=self.name,
            type=self.type,
            is_deleted=False
        ).exclude(pk=self.pk).exists():
            raise ValidationError({
                "name": "A category with this name and type already exists."
            })

    def __str__(self):
        return self.name

    
class Supplier(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    zip = models.CharField(max_length=4, blank=True, null=True)

    contact_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='supplier_logos/', blank=True, null=True)

    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Manufacturer(models.Model):
    name = models.CharField(max_length=50)
    manu_url = models.URLField(blank=True, null=True)

    support_url = models.URLField(blank=True, null=True)
    support_phone = models.CharField(max_length=13, blank=True, null=True)
    support_email = models.EmailField(blank=True, null=True)
    
    notes = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='manufacturer_logos/', blank=True, null=True)
    
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Status(models.Model):
    class StatusType(models.TextChoices):
        DEPLOYABLE = 'deployable', 'Deployable'
        DEPLOYED = 'deployed', 'Deployed'
        UNDEPLOYABLE = 'undeployable', 'Undeployable'
        PENDING = 'pending', 'Pending'
        ARCHIVED = 'archived', 'Archived'

    name = models.CharField(max_length=50)
    type = models.CharField(max_length=12, choices=StatusType.choices)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Depreciation(models.Model):
    name = models.CharField(max_length=500)
    duration = models.PositiveIntegerField(help_text="Duration in months")
    minimum_value = models.DecimalField(max_digits=8, decimal_places=2)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Location(models.Model):
    city = models.CharField(max_length=50, blank=True, null=True)
    zip = models.CharField(max_length=4, blank=True, null=True)

    def __str__(self):
        return self.city
     
class Ticket(models.Model):
    class TicketType(models.TextChoices):
        CHECKOUT = 'checkout', 'Checkout'
        CHECKIN = 'checkin', 'Checkin'

    # Details
    ticket_number = models.CharField(max_length=6, unique=True)
    ticket_type = models.CharField(max_length=10, choices=TicketType.choices)
    
    # Relations
    employee = models.CharField(max_length=100)
    asset = models.PositiveIntegerField()
    # Requestor details
    subject = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional fields depending on type
    # CHECKOUT
    checkout_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    # CHECKIN
    asset_checkout = models.PositiveIntegerField(null=True, blank=True)
    checkin_date = models.DateField(null=True, blank=True)

    def __str__(self):
        type = "Check Out Request" if self.asset_checkout is None else "Checked In Request"
        return f"[{self.ticket_number}] {self.asset} - {type} - {self.is_resolved}"