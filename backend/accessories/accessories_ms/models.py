from django.db import models

# Create your models here.
class Accessory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    category_id = models.IntegerField()
    manufacturer_id = models.IntegerField(blank=True, null=True)
    supplier_id = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)
    order_number = models.CharField(max_length=20, blank=True, null=True)
    model_number = models.CharField(max_length=20, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    minimum_quantity = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)  
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
class AccessoryImage(models.Model):
    accessory = models.ForeignKey(Accessory, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='accessory_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.accessory.name}"