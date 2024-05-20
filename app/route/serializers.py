from map.serializers import MapObjectSerializer
from rest_framework import serializers

from .models import BusStop
from .models import Route


class RouteSerializer(serializers.ModelSerializer):
    path_a = MapObjectSerializer(many=False, read_only=True)
    path_b = MapObjectSerializer(many=False, read_only=True)

    class Meta:
        model = Route
        fields = ["id", "name", "assigned_stops", "path_a", "path_b"]


class BusStopSerializer(serializers.ModelSerializer):
    location = MapObjectSerializer(many=False, read_only=True)

    class Meta:
        model = BusStop
        fields = ["id", "name", "city", "location"]
