"""
Django settings for consumables project.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
import logging
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure--ub5rx3t7p%1x1&yq&l)+_9l@bk9!@)7%de8cnc-#as^ssd*p='

# Update DEBUG setting to help troubleshoot
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Make sure ALLOWED_HOSTS includes your Railway domain
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1", "consumables-service-production.up.railway.app"]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'consumables_ms',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'consumables.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'consumables.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
if 'DATABASE_URL' in os.environ:
    logger.info(f"Using DATABASE_URL from environment")
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    logger.info(f"Using hardcoded database settings")
    # Fallback for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'railway',
            'USER': 'postgres',
            'PASSWORD': 'MIZWsGzljjOVHkIZZzXsOviQWYtNtuIK',
            'HOST': 'ballast.proxy.rlwy.net',
            'PORT': '45721',
        }
    }

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Extra places for collectstatic to find static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# WhiteNoise settings
WHITENOISE_MAX_AGE = 31536000  # 1 year in seconds

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Ensure CORS is properly configured
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://capstone1-production-1c05.up.railway.app",
]

# Add your Railway domain to CSRF_TRUSTED_ORIGINS with the exact format
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'https://capstone1-production-1c05.up.railway.app',
    'https://consumables-service-production.up.railway.app',
    'https://consumables.service.production.up.railway.app',
    'https://consumables-service-production-up.railway.app',
    'https://consumables.service.production-up.railway.app',
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ],
}