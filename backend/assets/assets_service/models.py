from django.db import models

# Create your models here.
class Products(models.Model):
    name = models.CharField(max_length=50, unique=True)
    model_number = models.CharField(max_length=20)
    end_of_life = models.DateField(null=True, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)

# ---------- Asset ----------
class Asset(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='assets')
    serial_number = models.CharField(max_length=100, unique=True)
    purchase_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.serial_number}"

class AssetImage(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='asset_images/', null=True, blank=True)

# ---------- Maintenance ----------
class Maintenance(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenances')
    date = models.DateField()
    notes = models.TextField(blank=True)
    performed_by = models.CharField(max_length=100)

    def __str__(self):
        return f"Maintenance on {self.asset.serial_number} at {self.date}"

class MaintenanceFile(models.Model):
    maintenance = models.ForeignKey(Maintenance, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='maintenance_files/')

# ---------- Audit Schedule and Audit ----------
class AuditSchedule(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='audit_schedules')
    scheduled_date = models.DateField()
    frequency = models.CharField(max_length=50)  # e.g., Monthly, Quarterly

    def __str__(self):
        return f"Audit Schedule for {self.asset.serial_number} on {self.scheduled_date}"

class Audit(models.Model):
    audit_schedule = models.ForeignKey(AuditSchedule, on_delete=models.CASCADE, related_name='audits')
    audit_date = models.DateField()
    findings = models.TextField()
    auditor = models.CharField(max_length=100)

    def __str__(self):
        return f"Audit on {self.audit_date} for {self.audit_schedule.asset.serial_number}"

class AuditFile(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='audit_files/')
