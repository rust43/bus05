from django.contrib import admin

from .models import BusStop
from .models import Route

# Register your models here.


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    model = Route
    list_display = ("name", "id")


@admin.register(BusStop)
class BusStopAdmin(admin.ModelAdmin):
    model = BusStop
    list_display = ("name", "id")
