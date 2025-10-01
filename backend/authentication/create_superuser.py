import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'authentication.settings')
django.setup()

from auth_service.models import CustomUser

# Check if user already exists
if CustomUser.objects.filter(email='admin@gmail.com').exists():
    print("User admin@gmail.com already exists!")
    user = CustomUser.objects.get(email='admin@gmail.com')
    # Update password
    user.set_password('Capstone123!')
    user.save()
    print("Password updated successfully!")
else:
    # Create new superuser
    user = CustomUser.objects.create_superuser(
        email='admin@gmail.com',
        password='Capstone123!',
        first_name='Admin',
        last_name='User',
        role='Admin',
        contact_number='09123456789'
    )
    print(f"Superuser created successfully: {user.email}")

