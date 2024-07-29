"""
ASGI config for bus05 project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bus05.settings")

application = get_asgi_application()
