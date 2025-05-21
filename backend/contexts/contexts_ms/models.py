from django.db import models

# Create your models here.
class Supplier(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    zip = models.PositiveSmallIntegerField(max_length=4, blank=True, null=True)

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