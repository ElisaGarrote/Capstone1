from django.db import models

# Create your models here.
class Supplier(models.Model):
    name = models.CharField(max_length=50, unique=True)

    addressline1 = models.CharField(max_length=100, blank=True, null=True)
    addressline2 = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    zip = models.CharField(max_length=10, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=60, blank=True, null=True)

    contact_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    fax = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    URL = models.URLField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='supplier_logos/', blank=True, null=True)

    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Category(models.Model):
    CATEGORY_CHOICES = [
        ('asset', 'Asset'), ('accessory', 'Accessory'), ('consumble', 'Consumable'), ('component', 'Component'),
    ]
    name = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    logo = models.ImageField(upload_to='category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Manufacturer(models.Model):
    name = models.CharField(max_length=50, unique=True)
    manu_url = models.URLField(blank=True, null=True)
    support_url = models.URLField(blank=True, null=True)
    support_phone = models.CharField(max_length=13, blank=True, null=True)
    support_email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='manufacturer_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name