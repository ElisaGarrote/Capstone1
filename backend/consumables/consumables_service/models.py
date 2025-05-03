from django.db import models

# Create your models here.
class Consumable(models.Model):
    location = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=50, unique=True)
    order_number = models.CharField(max_length=20, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True)  
    is_deleted = models.BooleanField(default=False)
    model_number = models.CharField(max_length=20, blank=True)
    quantity = models.IntegerField(blank=True, null=True)
    minimum_quantity = models.IntegerField(blank=True, null=True)
    supplier_id = models.IntegerField(blank=True, null=True)
    category_id = models.IntegerField()
    manufacturer_id = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class ConsumableImages(models.Model):
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='consumable_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.consumable.name}"