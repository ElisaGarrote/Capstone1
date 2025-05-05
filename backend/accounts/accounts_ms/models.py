from django.db import models

# Create your models here.
class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'), ('operator', 'Operator'),
    ]

    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=50, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)    
    contact_number = models.CharField(max_length=13)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}".strip()
    
class UserImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='user_images/')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.user.first_name} {self.user.last_name}"