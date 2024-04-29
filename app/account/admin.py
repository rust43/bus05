# pylint: disable=E0102

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "username",
                    "last_name",
                    "first_name",
                    "email",
                    "password",
                )
            },
        ),
        ("Служебные", {"fields": ("is_staff", "date_joined", "last_login")}),
    )
    list_display = ("username", "last_login")
