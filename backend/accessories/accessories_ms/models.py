from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class AccessoryCategory(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=9, default="Accessory")
    logo = models.ImageField(upload_to='accessory_category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Accessory(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(AccessoryCategory, on_delete=models.CASCADE)
    manufacturer_id = models.IntegerField()
    supplier_id = models.PositiveIntegerField(blank=True, null=True)
    location = models.CharField(max_length=50)
    model_number = models.CharField(max_length=50, blank=True, null=True)
    order_number = models.CharField(max_length=30, blank=True, null=True)
    purchase_date = models.DateField(timezone.now())
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    minimum_quantity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)  
    image = models.ImageField(upload_to='accessory_images/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class AccessoryCheckout(models.Model):
    accessory = models.ForeignKey(Accessory, on_delete=models.CASCADE, related_name='accessory_checkouts')
    to_user_id = models.PositiveIntegerField(blank=True, null=True)
    to_location = models.CharField(max_length=50, blank=True, null=True)
    checkout_date = models.DateField(default=timezone.now().date())
    return_date = models.DateField(blank=True, null=True)
    condition = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    notes = models.TextField(blank=True, null=True)
    confirmation_notes= models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='accessory_checkout_images/', blank=True, null=True)

    def __str__(self):
        return f"Checkout of {self.accessory.name} by user {self.to_user_id}"

class AccessoryCheckin(models.Model):
    STATUS_CHOICES = [
        ('deployed', 'Deployed'),
        ('deployable', 'Deployable'),
        ('ready to deploy', 'Ready to Deploy'),
    ]
     
    accessory_checkout = models.ForeignKey(AccessoryCheckout, on_delete=models.CASCADE, related_name='accessory_checkins')
    checkin_date = models.DateField(default=timezone.now().date())
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, blank=True, null=True)
    condition = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    notes = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=50)
    image = models.ImageField(upload_to='accessory_checkin_images/', blank=True, null=True)

    def __str__(self):
        return f"Checkin of {self.accessory_checkout.accessory.name} by user {self.accessory_checkout.to_user_id}"