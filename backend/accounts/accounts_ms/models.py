from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'), ('operator', 'Operator'),
    ]

    image = models.ImageField(upload_to='user_images/', blank=True, null=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=8, choices=ROLE_CHOICES)    
    contact_number = models.CharField(max_length=13)
    region = models.CharField(max_length=50)
    province = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    barangay = models.CharField(max_length=50)
    zip_code = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)]
    )
    street = models.CharField(max_length=50)
    house_number = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}".strip()