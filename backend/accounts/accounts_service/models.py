from django.db import models

# Create your models here.
class Users(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'), ('operator', 'Operator'),
    ]

    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='operator')    
    contact_number = models.CharField(max_length=13)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}".strip()
    
class UserImages(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(null=True, blank=True, upload_to='user_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.user.first_name} {self.user.last_name}"