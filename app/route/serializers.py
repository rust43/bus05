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
                object_type = ObjectType.objects.get_or_create(**object_type_data)
                location_data["object_type"] = object_type[0]
            point_data = location_data.pop("point")
            if point_data:
                point = ObjectPoint.objects.get_or_create(**point_data)[0]
            location = MapObject.objects.get_or_create(**location_data)[0]
            try:
                location.point.delete()
                point.map_object = location
            except MapObject.point.RelatedObjectDoesNotExist:
                point.map_object = location
            point.save()
            location_data["point"] = point
            validated_data["location"] = location
            busstop, created = BusStop.objects.update_or_create(**validated_data)
            location.name = "busstop-" + str(busstop.id)
            location.save()
            return busstop
        # return BusStop.objects.create(**validated_data)


class BusStopSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["id", "name"]

    id = serializers.IntegerField(read_only=True)


class RouteSerializer(serializers.ModelSerializer):
    path_a = MapObjectSerializer(many=False)
    path_b = MapObjectSerializer(many=False)
    path_a_stops = BusStopSerializer(many=True, required=False)
    path_b_stops = BusStopSerializer(many=True, required=False)

    class Meta:
        model = Route
        fields = ["id", "name", "path_a", "path_b", "path_a_stops", "path_b_stops"]
