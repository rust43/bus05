from map.serializers import MapObjectSerializer
from rest_framework import serializers
from route.functions import parse_path
from route.functions import parse_point

from .models import BusStop
from .models import Route


class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["id", "name", "location"]

    id = serializers.UUIDField()
    location = MapObjectSerializer(many=False)

    def create(self, validated_data):
        try:
            busstop_id = validated_data["id"]
            name = validated_data["name"]
            location = validated_data["location"]
        except KeyError:
            return None
        busstop = BusStop.objects.get_or_create(pk=busstop_id)[0]
        try:
            location, point = parse_point(
                "busstop-" + str(busstop.id),
                location["object_type"]["name"],
                location["point"]["geom"],
            )
            location.save()
            point.save()
        except KeyError:
            return None
        busstop.name = name
        if busstop.location:
            busstop.location.delete()
        busstop.location = location
        busstop.save()
        return busstop


class BusStopSimpleSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField()

    class Meta:
        model = BusStop
        fields = ["id", "name"]


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["id", "name", "path_a", "path_b", "path_a_stops", "path_b_stops"]

    id = serializers.UUIDField()
    path_a = MapObjectSerializer(many=False)
    path_b = MapObjectSerializer(many=False)
    path_a_stops = BusStopSimpleSerializer(many=True, required=False)
    path_b_stops = BusStopSimpleSerializer(many=True, required=False)

    def create(self, validated_data):
        try:
            route_id = validated_data["id"]
            name = validated_data["name"]
            path_a = validated_data["path_a"]
            path_b = validated_data["path_b"]
            path_a_stops = validated_data["path_a_stops"]
            path_b_stops = validated_data["path_b_stops"]
        except KeyError:
            return None
        # get or create route
        route = Route.objects.get_or_create(pk=route_id)[0]
        # parse path a
        try:
            path_a, line = parse_path(
                "route-" + str(route.id) + "-path-a",
                path_a["object_type"]["name"],
                path_a["line"]["geom"],
            )
            path_a.save()
            line.save()
        except KeyError:
            return None
        # parse path b
        try:
            path_b, line = parse_path(
                "route-" + str(route.id) + "-path-b",
                path_b["object_type"]["name"],
                path_b["line"]["geom"],
            )
            path_b.save()
            line.save()
        except KeyError:
            return None
        # parse path_a_stops
        route.path_a_stops.clear()
        for stop in path_a_stops:
            try:
                busstop = BusStop.objects.get(pk=stop["id"])
            except BusStop.DoesNotExist:
                continue
            route.path_a_stops.add(busstop)
        # parse path_b_stops
        route.path_b_stops.clear()
        for stop in path_b_stops:
            try:
                busstop = BusStop.objects.get(pk=stop["id"])
            except BusStop.DoesNotExist:
                continue
            route.path_b_stops.add(busstop)
        # setting new name
        route.name = name
        # setting new paths
        if route.path_a:
            route.path_a.delete()
        route.path_a = path_a
        if route.path_b:
            route.path_b.delete()
        route.path_b = path_b
        # saving
        route.save()
        return route
