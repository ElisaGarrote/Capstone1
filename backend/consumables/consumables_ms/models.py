from django.db import models
from django.utils import timezone

class ConsumableCategory(models.Model):
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, default="Consumable")
    logo = models.ImageField(upload_to='consumable_category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Consumable(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ConsumableCategory, on_delete=models.CASCADE)
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
    image = models.ImageField(upload_to='consumable_images/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    