from django.contrib import admin

from .models import Route

# Register your models here.


@admin.register(Route)
class PointAdmin(admin.ModelAdmin):
    model = Route
    list_display = ("id", "name")
