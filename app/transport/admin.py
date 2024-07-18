from django.contrib import admin

from .models import Transport
from .models import TransportPoint
from .models import TransportType


@admin.register(TransportType)
class TransportTypeAdmin(admin.ModelAdmin):
    model = TransportType
    list_display = ("name", "id")


@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    model = Transport
    list_display = ("imei", "name", "transport_type", "route")


@admin.register(TransportPoint)
class TransportPointAdmin(admin.ModelAdmin):
    model = TransportPoint
    list_display = ("imei", "date", "speed")
