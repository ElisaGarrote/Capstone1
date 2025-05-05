from django.db import models
from django.utils import timezone

# Create your models here.
class Depreciation(models.Model):
    name = models.CharField(max_length=20, unique=True)
    duration = models.PositiveIntegerField(help_text="Duration in months")
    minimum_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=50, unique=True)
    category_id = models.IntegerField()
    manufacturer_id = models.IntegerField(blank=True, null=True)
    depreciation = models.ForeignKey(Depreciation, on_delete=models.SET_NULL, blank=True, null=True, related_name='products')
    model_number = models.CharField(max_length=20, blank=True, null=True)
    end_of_life = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    default_supplier_id = models.IntegerField(blank=True, null=True)
    minimum_quantity = models.IntegerField(blank=True, null=True)
    operating_system = models.CharField(max_length=20, blank=True, null=True)
    imei_number = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image(s) for {self.product.name}"

class Status(models.Model):
    STATUS_CHOICES = [
        ('deployable', 'Deployable'), ('deployed', 'Deployed'), ('undeployable', 'Undeployable'), ('pending', 'Pending'), ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=20, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Asset(models.Model):
    displayed_id = models.CharField(max_length=20, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_assets')
    status = models.ForeignKey(Status, on_delete=models.CASCADE, null=True, related_name='status_assets')
    supplier_id = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    serial_number = models.CharField(max_length=20, blank=True, null=True)
    warranty_expiration = models.DateField(blank=True, null=True)
    order_number = models.CharField(max_length=20, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)  
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.displayed_id

class AssetImage(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='asset_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.asset.displayed_id}"

class Repair(models.Model):
    REPAIR_CHOICES = [
        ('maintenance', 'Maintenance'), ('repair', 'Repair'), ('upgrade', 'Upgrade'), ('test', 'Test'), ('hardware', 'Hardware'), ('software', 'Software'),
    ]
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='repair_assets')
    supplier_id = models.IntegerField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=REPAIR_CHOICES) 
    name = models.CharField(max_length=20, unique=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Repairs on {self.asset.serial_number} at {self.start_date}"

class RepairFile(models.Model):
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='maintenance_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File(s) for {self.repair.name}"
    

class AuditSchedule(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='audits')
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Audit Schedule for {self.asset.displayed_id} on {self.date}"

class Audit(models.Model):
    location = models.CharField(max_length=50)
    user_id = models.IntegerField()
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    audit_schedule = models.ForeignKey(AuditSchedule, on_delete=models.CASCADE, related_name='asset_audits')

    def __str__(self):
        return f"Audit on {self.created_at} for {self.audit_schedule.asset.displayed_id}"

class AuditFile(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='audit_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File(s) for audit on {self.audit.created_at} for {self.audit.audit_schedule.asset.displayed_id}"