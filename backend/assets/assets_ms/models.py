from django.db import models

# Create your models here.
class Depreciation(models.Model):
    name = models.CharField(max_length=20, unique=True)
    duration = models.PositiveIntegerField(help_text="Duration in months")
    minimum_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=50, unique=True)
    model_number = models.CharField(max_length=20, blank=True)
    end_of_life = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    minimum_quantity = models.IntegerField(blank=True, null=True)
    operating_system = models.CharField(max_length=20, blank=True)
    imei_number = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    supplier_id = models.IntegerField(blank=True, null=True)
    category_id = models.IntegerField()
    manufacturer_id = models.IntegerField(blank=True, null=True)
    depreciation = models.ForeignKey(Depreciation, on_delete=models.SET_NULL, null=True, related_name='products')

    def __str__(self):
        return self.name
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='product_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image(s) for {self.product.name}"

class Status(models.Model):
    STATUS_CHOICES = [
        ('deployable', 'Deployable'), ('undeployable', 'Undeployable'), ('pending', 'Pending'), ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=20, choices=STATUS_CHOICES, default='deployable')
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Asset(models.Model):
    location = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=50, blank=True)
    order_number = models.CharField(max_length=20, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True)  
    is_deleted = models.BooleanField(default=False)
    displayed_id = models.CharField(max_length=20, unique=True)
    serial_number = models.CharField(max_length=20, blank=True)
    warranty_expiration = models.DateField(null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_assets')
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, related_name='status_assets')

    def __str__(self):
        return self.displayed_id

class AssetImage(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='asset_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.asset.displayed_id}"

class Repair(models.Model):
    REPAIR_CHOICES = [
        ('maintenance', 'Maintenance'), ('repair', 'Repair'), ('upgrade', 'Upgrade'), ('test', 'Test'), ('hardware', 'Hardware'), ('software', 'Software'),
    ]
    type = models.CharField(max_length=20, choices=REPAIR_CHOICES, default='Maintenance')
    name = models.CharField(max_length=20, unique=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    supplier_id = models.IntegerField(blank=True, null=True)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='repair_assets')

    def __str__(self):
        return f"Repairs on {self.asset.serial_number} at {self.start_date}"

class RepairAttachment(models.Model):
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='maintenance_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File/s for {self.repair.name}"
    

class AuditSchedule(models.Model):
    date = models.DateField()
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='audit_assets')

    def __str__(self):
        return f"Audit Schedule for {self.asset.displayed_id} on {self.date}"

class Audit(models.Model):
    location = models.CharField(max_length=50, blank=True)
    user_id = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    audit_schedule = models.ForeignKey(AuditSchedule, on_delete=models.CASCADE, related_name='audits')

    def __str__(self):
        return f"Audit on {self.created_at} for {self.audit_schedule.asset.displayed_id}"

class AuditFile(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='audit_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File/s for audit on {self.audit.created_at} for {self.audit.audit_schedule.asset.displayed_id}"