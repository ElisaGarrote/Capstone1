from django.db import models

# Create your models here.
class Accessories(models.Model):
    location = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=50)
    order_number = models.CharField(max_length=20, blank=True)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)  
    is_deleted = models.BooleanField(default=False)
    model_number = models.CharField(max_length=20, blank=True)
    quantity = models.IntegerField(blank=True, null=True)
    minimum_quantity = models.IntegerField(blank=True, null=True)
    supplier_id = models.IntegerField(blank=True, null=True)
    category_id = models.IntegerField(blank=True, null=True)
    manufacturer_id = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class AccessoryImages(models.Model):
    accessory = models.ForeignKey(Accessories, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='accessory_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.accessory.name}"