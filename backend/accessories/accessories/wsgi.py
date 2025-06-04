import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'accessories.settings')

application = get_wsgi_application()
application = WhiteNoise(application)
application.add_files(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'staticfiles'), prefix='static/')
