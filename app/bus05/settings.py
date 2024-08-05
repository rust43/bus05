import os
from pathlib import Path

from bus05 import local_settings

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = local_settings.SECRET_KEY

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "45.129.201.0"]

CSRF_TRUSTED_ORIGINS = ["http://45.129.201.0",]

if os.name == "nt":
    GDAL_LIBRARY_PATH = os.path.join(BASE_DIR, "..\\..\\..\\..\\.postgres\\bin\\libgdal-33.dll")
    GEOS_LIBRARY_PATH = os.path.join(BASE_DIR, "..\\..\\..\\..\\.postgres\\bin\\libgeos_c.dll")
    os.environ["PATH"] = os.path.join(BASE_DIR, "..\\..\\venv\\Lib\\site-packages\\osgeo") + ";" + os.environ["PATH"]
    os.environ["PROJ_LIB"] = (
        os.path.join(BASE_DIR, "..\\..\\venv\\Lib\\site-packages\\osgeo\\data\\proj") + ";" + os.environ["PATH"]
    )

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "rest_framework",
    "rest_framework_gis",
    "haversine",
    "main",
    "account",
    "map",
    "route",
    "transport",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly",
    ]
}

ROOT_URLCONF = "bus05.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "bus05.wsgi.application"


# Database

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "HOST": local_settings.DBHOST,
        "NAME": local_settings.DBNAME,
        "USER": local_settings.DBUSER,
        "PASSWORD": local_settings.DBPASSWORD,
        "PORT": local_settings.DBPORT,
    }
}


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization

LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = "static/"
if DEBUG:
    STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
else:
    STATIC_ROOT = os.path.join(BASE_DIR, "static")


# Media files

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "media/"

# Login urls

LOGIN_REDIRECT_URL = "/"
LOGIN_URL = "login/"

# Define authentication for abstract user model
AUTH_USER_MODEL = "account.User"

# Default primary key field type

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
