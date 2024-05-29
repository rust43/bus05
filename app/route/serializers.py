from map.serializers import MapObjectSerializer
from rest_framework import serializers

from .models import BusStop
from .models import Route


class BusStopSerializer(serializers.ModelSerializer):
    location = MapObjectSerializer(many=False, read_only=True)

    class Meta:
        model = BusStop
        fields = ["id", "name", "city", "location"]


class BusStopSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["id", "name"]


class RouteSerializer(serializers.ModelSerializer):
    path_a = MapObjectSerializer(many=False, read_only=True)
    path_b = MapObjectSerializer(many=False, read_only=True)
    path_a_stops = BusStopSimpleSerializer(many=True, read_only=True)
    path_b_stops = BusStopSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ["id", "name", "path_a", "path_b", "path_a_stops", "path_b_stops"]
