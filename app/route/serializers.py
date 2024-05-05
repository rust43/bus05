from rest_framework import serializers

from .models import Route


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["id", "name", "assigned_stops", "path_a", "path_b"]
