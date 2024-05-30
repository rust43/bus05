import json

from django.contrib.gis.geos import LineString
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from map.models import MapObject
from map.models import ObjectCircle
from map.models import ObjectLineString
from map.models import ObjectPoint
from map.models import ObjectPolygon
from map.models import ObjectType
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BusStop
from .models import Route
from .permissions import HasGroupPermission
from .serializers import BusStopSerializer
from .serializers import RouteSerializer


class RouteApiView(APIView):
    permission_classes = [HasGroupPermission]

    required_groups = {
        "GET": ["__all__"],
        "POST": ["map_admins"],
        "PUT": ["map_admins"],
        "DELETE": ["map_admins"],
    }

    @staticmethod
    def get(request, *args, **kwargs):
        """
        List all Routes
        """
        routes = Route.objects.all()
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new Route
        """
        name = request.data.get("name")
        path_a_stops = request.data.get("path_a_stops")
        path_b_stops = request.data.get("path_b_stops")
        geojson = request.data.get("geojson_data")
        map_data = parse_geojson(geojson)

        if map_data:
            route = Route(name=name)
            # path data parse
            for path in map_data[0]:
                if "path-a" in path.name:
                    path.name = "route-" + str(route.id) + "-path-a"
                    path.save()
                    path.line.save()
                    route.path_a = path
                elif "path-b" in path.name:
                    path.name = "route-" + str(route.id) + "-path-b"
                    path.save()
                    path.line.save()
                    route.path_b = path
            route.save()
            # busstop data parse
            for busstop_data in path_a_stops:
                busstop = BusStop.objects.get(pk=busstop_data)
                route.path_a_stops.add(busstop)
            for busstop_data in path_b_stops:
                busstop = BusStop.objects.get(pk=busstop_data)
                route.path_b_stops.add(busstop)
            route.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit Route data
        """
        name = request.data.get("name")
        geojson = request.data.get("geojson_data")
        path_a_stops = request.data.get("path_a_stops")
        path_b_stops = request.data.get("path_b_stops")
        map_data = parse_geojson(geojson)
        if map_data:
            for route_data in map_data.items():
                route = Route.objects.get(pk=route_data[0])
                for path in route_data[1]:
                    if "path-a" in path.name:
                        route.path_a.delete()
                        path.save()
                        path.line.save()
                        route.path_a = path
                    elif "path-b" in path.name:
                        route.path_b.delete()
                        path.save()
                        path.line.save()
                        route.path_b = path
                route.name = name
                route.save()
                # busstop data parse
                route.path_a_stops.clear()
                for busstop_data in path_a_stops:
                    busstop = BusStop.objects.get(pk=busstop_data)
                    route.path_a_stops.add(busstop)
                route.path_b_stops.clear()
                for busstop_data in path_b_stops:
                    busstop = BusStop.objects.get(pk=busstop_data)
                    route.path_b_stops.add(busstop)
                route.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete Route
        """
        route_id = request.data.get("route_id")
        try:
            route = Route.objects.get(pk=route_id)
            route.path_a.delete()
            route.path_b.delete()
            route.delete()
            return Response(status=status.HTTP_200_OK)
        except Route.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


def parse_geojson(features):
    data = json.loads(features)
    parsed_features = {}
    for feature in data["features"]:
        name = feature["properties"]["name"]
        coordinates = feature["geometry"]["coordinates"]
        geometry_type = feature["geometry"]["type"]

        # check if object newly created or exists in database
        if feature["properties"].get("map_object_id"):
            map_object_id = feature["properties"]["map_object_id"]
        else:
            map_object_id = 0

        map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
        map_object = MapObject(name=name, object_type=map_object_type)
        # map_object = MapObject.objects.create(name=name, object_type=map_object_type)
        geom = None
        if geometry_type == "Point":
            coordinates = list(map(float, coordinates))
            geom = Point((coordinates[0], coordinates[1]), srid=4326)
            ObjectPoint(map_object=map_object, geom=geom)
            # ObjectPoint.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "LineString":
            for coordinate in coordinates:
                coordinate = list(map(float, coordinate))
            geom = LineString(coordinates, srid=4326)
            ObjectLineString(map_object=map_object, geom=geom)
            # ObjectLineString.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "Circle":
            coordinates = list(map(float, coordinates))
            geom = Point((coordinates[0], coordinates[1]), srid=4326)
            ObjectCircle.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "Polygon":
            for coordinate in coordinates[0]:
                coordinate = list(map(float, coordinate))
            geom = Polygon(coordinates[0], srid=4326)
            ObjectPolygon.objects.create(map_object=map_object, geom=geom)

        if parsed_features.get(map_object_id):
            parsed_features[map_object_id].append(map_object)
        else:
            parsed_features[map_object_id] = [map_object]
        # parsing props
        # for prop, value in feature["properties"].items():
        #     MapObjectProp.objects.create(map_object=map_object, prop=prop, value=value)
    return parsed_features


class BusStopApiView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["__all__"],
        "POST": ["map_admins"],
        "PUT": ["map_admins"],
        "DELETE": ["map_admins"],
    }

    @staticmethod
    def get(request, *args, **kwargs):
        """
        List all BusStops
        """
        stops = BusStop.objects.all()
        serializer = BusStopSerializer(stops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new BusStop
        """
        name = request.data.get("name")
        # city = request.data.get("city")
        geojson = request.data.get("geojson_data")
        map_data = parse_geojson(geojson)

        if map_data:
            busstop = BusStop(name=name)
            location = map_data[0][0]
            location.name = "busstop-" + str(busstop.id)
            location.save()
            location.point.save()
            busstop.location = location
            busstop.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit BusStop data
        """
        name = request.data.get("name")
        geojson = request.data.get("geojson_data")
        map_data = parse_geojson(geojson)
        if map_data:
            busstop = next(iter(map_data))
            location = map_data[busstop][0]
            busstop = BusStop.objects.get(pk=busstop)
            busstop.location.delete()
            location.save()
            location.point.save()
            busstop.location = location
            busstop.name = name
            busstop.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete BusStop
        """
        busstop_id = request.data.get("busstop_id")
        try:
            busstop = BusStop.objects.get(pk=busstop_id)
            busstop.location.delete()
            busstop.delete()
            return Response(status=status.HTTP_200_OK)
        except BusStop.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class DataApiView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["map_admins"],
        "POST": ["map_admins"],
    }

    @staticmethod
    def get(request, *args, **kwargs):
        """
        Get all data
        """
        busstops = BusStop.objects.all()
        routes = Route.objects.all()
        data = {
            "busstops": BusStopSerializer(busstops, many=True).data,
            "routes": RouteSerializer(routes, many=True).data
        }
        return Response(data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Import new data to system
        """
        file = request.data.get("file")
        # map_data = parse_geojson(geojson)

        if file:
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
