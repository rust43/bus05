from django.contrib import admin

from .models import BusStop
from .models import BusStopOrderA
from .models import BusStopOrderB
from .models import Route
from .models import RouteType

# Register your models here.


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    model = Route
    list_display = ("name", "id")


@admin.register(BusStop)
class BusStopAdmin(admin.ModelAdmin):
    model = BusStop
    list_display = ("name", "id")


@admin.register(RouteType)
class RouteTypeAdmin(admin.ModelAdmin):
    model = RouteType
    list_display = ("name", "id")


@admin.register(BusStopOrderA)
class BusstopOrderAAdmin(admin.ModelAdmin):
    pass


@admin.register(BusStopOrderB)
class BusstopOrderBAdmin(admin.ModelAdmin):
    pass
