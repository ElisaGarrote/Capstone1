from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class ComponentCategory(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=9, default="Component")
    logo = models.ImageField(upload_to='component_category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Component(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ComponentCategory, on_delete=models.CASCADE)
    manufacturer_id = models.PositiveIntegerField()
    location = models.CharField(max_length=50)
    model_number = models.CharField(max_length=50, blank=True, null=True)
    order_number = models.CharField(max_length=30, blank=True, null=True)
    purchase_date = models.DateField(auto_now_add=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    minimum_quantity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)  
    image = models.ImageField(upload_to='component_images/', blank=True, null=True)
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
    
class AssetCategory(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=5, default="Asset")
    logo = models.ImageField(upload_to='asset_category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Product(models.Model):
    OS_CHOICES = [
        ('linux', 'Linux'),
        ('windows', 'Windows'),
        ('macos', 'macOS'),
        ('ubuntu', 'Ubuntu'),
        ('centos', 'CentOS'),
        ('debian', 'Debian'),
        ('fedora', 'Fedora'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    category = models.ForeignKey(AssetCategory, on_delete=models.CASCADE)
    manufacturer_id = models.PositiveIntegerField()
    depreciation = models.ForeignKey(
        Depreciation,
        on_delete=models.PROTECT,
        related_name='depreciations'
    )
    model_number = models.CharField(max_length=50, blank=True, null=True)
    end_of_life = models.DateField(blank=True, null=True)
    default_purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    default_supplier_id = models.PositiveIntegerField(blank=True, null=True)
    minimum_quantity = models.PositiveIntegerField(default=1)
    operating_system = models.CharField(max_length=7, choices=OS_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Status(models.Model):
    STATUS_CHOICES = [
        ('deployable', 'Deployable'), ('deployed', 'Deployed'), ('undeployable', 'Undeployable'), ('pending', 'Pending'), ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=50)
    type = models.CharField(max_length=12, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Asset(models.Model):
    displayed_id = models.CharField(max_length=20, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_assets')
    status = models.ForeignKey(Status, on_delete=models.CASCADE, related_name='status_assets')
    supplier_id = models.PositiveIntegerField(blank=True, null=True)
    location = models.CharField(max_length=50)
    name = models.CharField(max_length=50, blank=True, null=True)
    serial_number = models.CharField(max_length=50, blank=True, null=True)
    warranty_expiration = models.DateField(blank=True, null=True)
    order_number = models.CharField(max_length=50, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='asset_images/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.displayed_id
class AssetCheckout(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='asset_checkouts')
    to_user_id = models.PositiveIntegerField(blank=True, null=True)
    to_location = models.CharField(max_length=50, blank=True, null=True)
    checkout_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(blank=True, null=True)
    condition = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    notes = models.TextField(blank=True, null=True)
    confirmation_notes= models.TextField(blank=True, null=True)
    location = models.CharField(max_length=50)
    image = models.ImageField(upload_to='asset_checkout_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Checkout of {self.asset.displayed_id} by user {self.to_user_id}"

class AssetCheckin(models.Model):
    asset_checkout = models.ForeignKey(AssetCheckout, on_delete=models.CASCADE, related_name='asset_checkins')
    checkin_date = models.DateTimeField(blank=True, null=True)
    status = models.ForeignKey(Status, on_delete=models.CASCADE, related_name='status_assets_checkins')
    condition = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    notes = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=50)
    image = models.ImageField(upload_to='asset_checkin_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Checkin of {self.asset_checkout.asset.displayed_id} by user {self.asset_checkout.to_user_id}"
    
class ComponentCheckout(models.Model):
    component = models.ForeignKey(Component, on_delete=models.CASCADE, related_name='components_checkouts')
    to_asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='checkout_to')
    quantity = models.PositiveIntegerField(default=1)
    checkout_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Checkout of {self.component.name} to {self.to_asset.displayed_id}"

class ComponentCheckin(models.Model):
    component_checkout = models.ForeignKey(ComponentCheckout, on_delete=models.CASCADE, related_name='component_checkins')
    checkin_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Checkin of {self.component_checkout.component.name} from {self.component_checkout.to_asset.displayed_id}"
    
class Repair(models.Model):
    REPAIR_CHOICES = [
        ('maintenance', 'Maintenance'), ('repair', 'Repair'), ('upgrade', 'Upgrade'), ('test', 'Test'), ('hardware', 'Hardware'), ('software', 'Software'),
    ]
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='repair_assets')
    type = models.CharField(max_length=20, choices=REPAIR_CHOICES) 
    name = models.CharField(max_length=100)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Repairs on {self.asset.serial_number} at {self.start_date}"

class RepairFile(models.Model):
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='repair_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File for repair: {self.repair.name}"
    

class AuditSchedule(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='audits')
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now(), editable=False)

    def __str__(self):
        return f"Audit Schedule for {self.asset.displayed_id} on {self.date}"

class Audit(models.Model):
    location = models.CharField(max_length=50)
    user_id = models.IntegerField()
    audit_date = models.DateField(default=timezone.now().date())
    next_audit_date = models.DateField(default=timezone.now().date())
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    audit_schedule = models.ForeignKey(AuditSchedule, on_delete=models.CASCADE, related_name='asset_audits')
    created_at = models.DateTimeField(default=timezone.now(), editable=False)

    def __str__(self):
        return f"Audit on {self.created_at} for {self.audit_schedule.asset.displayed_id}"

class AuditFile(models.Model):
    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='audit_files/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"File(s) for audit on {self.audit.created_at} for {self.audit.audit_schedule.asset.displayed_id}"