from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=9, default="Accessory")
    logo = models.ImageField(upload_to='accessory_category_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Accessory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
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
    image = models.ImageField(upload_to='accessory_images/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
