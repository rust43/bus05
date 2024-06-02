from map.models import MapObject
from map.models import ObjectPoint
from map.models import ObjectType
from map.serializers import MapObjectSerializer
from rest_framework import serializers

from .models import BusStop
from .models import Route


class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["id", "name", "location"]

    id = serializers.ReadOnlyField()
    location = MapObjectSerializer(many=False)

    def create(self, validated_data):
        location_data = validated_data.pop("location")
        if location_data:
            # parse object type
            object_type_data = location_data.pop("object_type")
            if object_type_data:
                object_type, created = ObjectType.objects.get_or_create(**object_type_data)
                location_data["object_type"] = object_type
            # parse point
            point_data = location_data.pop("point")
            if point_data:
                point, created = ObjectPoint.objects.get_or_create(**point_data)
            if created:
                location = MapObject.objects.create(**location_data)
                point.map_object = location
                point.save()
            else:
                location = point.map_object
            location_data["point"] = point
            validated_data["location"] = location
            name_data = validated_data.pop("name")
            busstop, created = BusStop.objects.update_or_create(**validated_data)
            location.name = "busstop-" + str(busstop.id)
            location.save()
            busstop.name = name_data
            busstop.save()
            return busstop


class BusStopSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["id", "name"]


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["id", "name", "path_a", "path_b", "path_a_stops", "path_b_stops"]

    path_a = MapObjectSerializer(many=False)
    path_b = MapObjectSerializer(many=False)
    path_a_stops = BusStopSerializer(many=True, required=False)
    path_b_stops = BusStopSerializer(many=True, required=False)
