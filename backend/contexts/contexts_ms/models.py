from django.db import models
from django.core.exceptions import ValidationError

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
        # Check for categories with the same name and type that has is_deleted=False
        # Safe registration for django admin
        if Category.objects.filter(
            name__exact=self.name,
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
    URL = models.URLField(blank=True, null=True)

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
    
from django.db import models

class Ticket(models.Model):
    ticket_id = models.CharField(max_length=100, unique=True)

    asset_id = models.IntegerField(null=True, blank=True)

    requestor = models.CharField(max_length=100)
    requestor_location = models.CharField(max_length=255)
    requestor_id = models.IntegerField(null=True, blank=True)

    checkout_date = models.DateField(null=True, blank=True)
    checkin_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)

    is_resolved = models.BooleanField(default=False)

    checkout_ref_id = models.CharField(max_length=100, default="1", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    condition = models.IntegerField(default=1, null=True, blank=True)

    class Meta:
        ordering = ['-checkout_date']
        verbose_name = "Asset Checkout"
        verbose_name_plural = "Asset Checkouts"

    def __str__(self):
        status = "Checked Out" if self.is_resolved else "Checked In"
        return f"[{self.ticket_id}] {self.asset_name} - {status}"