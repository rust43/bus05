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
        stops = request.data.get("assigned_stops")
        geojson = request.data.get("geojson_data")
        path_data = parse_geojson(geojson)

        if path_data.get("route-path-a") and path_data.get("route-path-b"):
            new_route = Route(name=name)
            path_a = path_data["route-path-a"]
            path_a.name = "route-" + str(new_route.id) + "-path-a"
            path_a.save()
            path_b = path_data["route-path-b"]
            path_b.name = "route-" + str(new_route.id) + "-path-b"
            path_b.save()
            new_route.path_a = path_a
            new_route.path_b = path_b
            new_route.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


def parse_geojson(features):
    data = json.loads(features)
    parsed_data = {}
    for feature in data["features"]:
        name = feature["properties"]["name"]
        coordinates = feature["geometry"]["coordinates"]
        geometry_type = feature["geometry"]["type"]
        map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
        map_object = MapObject.objects.create(name=name, object_type=map_object_type)
        geom = None
        if geometry_type == "Point":
            coordinates = list(map(float, coordinates))
            geom = Point((coordinates[0], coordinates[1]), srid=4326)
            ObjectPoint.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "LineString":
            for coordinate in coordinates:
                coordinate = list(map(float, coordinate))
            geom = LineString(coordinates, srid=4326)
            ObjectLineString.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "Circle":
            coordinates = list(map(float, coordinates))
            geom = Point((coordinates[0], coordinates[1]), srid=4326)
            ObjectCircle.objects.create(map_object=map_object, geom=geom)
        elif geometry_type == "Polygon":
            for coordinate in coordinates[0]:
                coordinate = list(map(float, coordinate))
            geom = Polygon(coordinates[0], srid=4326)
            ObjectPolygon.objects.create(map_object=map_object, geom=geom)
        parsed_data[str(name)] = map_object
        # parsing props
        # for prop, value in feature["properties"].items():
        #     MapObjectProp.objects.create(map_object=map_object, prop=prop, value=value)
    return parsed_data


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
        city = request.data.get("city")
        geojson = request.data.get("geojson_data")
        map_data = parse_geojson(geojson)

        if map_data.get("busstop-new-location"):
            new_busstop = BusStop(name=name)
            map_object = map_data["busstop-new-location"]
            map_object.name = "busstop-" + str(new_busstop.id)
            map_object.save()
            new_busstop.location = map_object
            new_busstop.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


# def process_geo_json(data, route):
#     data = json.loads(data)
#     for feature in data["features"]:
#         coordinates = feature["geometry"]["coordinates"]
#         if "name" in feature["properties"]:
#             feature_name = feature["properties"]["name"]
#         else:
#             feature_name = "неименованный объект карты"
#         geometry_type = feature["properties"]["type"]
#         map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
#         map_object = MapObject.objects.create(name=feature_name, zone=zone, object_type=map_object_type)
#         if geometry_type == "Point":
#             coordinates = list(map(float, coordinates))
#             point = Point((coordinates[0], coordinates[1]), srid=4326)
#             ObjectPoint.objects.create(map_object=map_object, geom=point)

#         elif geometry_type == "Circle":
#             coordinates = list(map(float, coordinates))
#             circle = Point((coordinates[0], coordinates[1]), srid=4326)
#             ObjectCircle.objects.create(map_object=map_object, geom=circle)

#         elif geometry_type == "LineString":
#             for coordinate in coordinates:
#                 coordinate = list(map(float, coordinate))
#             line_string = LineString(coordinates, srid=4326)
#             ObjectLineString.objects.create(map_object=map_object, geom=line_string)

#         elif geometry_type == "Polygon":
#             for coordinate in coordinates[0]:
#                 coordinate = list(map(float, coordinate))
#             polygon = Polygon(coordinates[0], srid=4326)
#             ObjectPolygon.objects.create(map_object=map_object, geom=polygon)

#         for prop, value in feature["properties"].items():
#             MapObjectProp.objects.create(map_object=map_object, prop=prop, value=value)
