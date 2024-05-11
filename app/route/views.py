import json

from django.contrib.auth.decorators import login_required
from django.contrib.gis.geos import LineString
from django.http import HttpResponseNotFound
from django.shortcuts import render
from map.models import MapObject
from map.models import ObjectLineString
from map.models import ObjectPoint
from map.models import ObjectType
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BusStop
from .models import Route
from .permissions import HasGroupPermission
from .serializers import RouteSerializer


@login_required
def map_edit_view(request):
    if not request.user.groups.filter(name="map_admins").exists():
        return HttpResponseNotFound("У вас нет доступа к данной странице.")
    return render(request, "route/map_edit.html", {})


class RouteApiView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["__all__"],
        "POST": ["map_admins"],
        "PUT": ["map_admins"],
    }

    @staticmethod
    def get(request, *args, **kwargs):
        """
        List all routes
        """
        routes = Route.objects.all()
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new route
        """
        new_route_name = request.data.get("name")
        new_route_features = request.data.get("geojson_data")
        new_route_stops = request.data.get("assigned_stops")
        path_a, path_b = process_newroute_geojson(new_route_features)
        if None not in (path_a, path_b) and isinstance(path_a, LineString) and isinstance(path_b, LineString):
            create_route(new_route_name, new_route_stops, path_a, path_b)
            return Response(status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_400_BAD_REQUEST)


def process_newroute_geojson(new_route_features):
    route_data = json.loads(new_route_features)
    path_a = None
    path_b = None
    for feature in route_data["features"]:
        name = feature["properties"]["name"]
        coordinates = feature["geometry"]["coordinates"]
        geometry_type = feature["geometry"]["type"]
        if geometry_type != "LineString":
            continue
        for coordinate in coordinates:
            coordinate = list(map(float, coordinate))
        line_string = LineString(coordinates, srid=4326)
        if name == "route-path-a":
            path_a = line_string
        elif name == "route-path-b":
            path_b = line_string
        else:
            continue
    return path_a, path_b


def create_route(name: str, stops: list, path_a: LineString, path_b: LineString):
    # routes linestrings
    map_path_object_type = ObjectType.objects.get_or_create(name="LineString")[0]
    path_a_map_object = MapObject.objects.create(name="route-" + name + "-path-a", object_type=map_path_object_type)
    ObjectLineString.objects.create(map_object=path_a_map_object, geom=path_a)
    path_b_map_object = MapObject.objects.create(name="route-" + name + "-path-b", object_type=map_path_object_type)
    ObjectLineString.objects.create(map_object=path_b_map_object, geom=path_b)

    new_route = Route.objects.create(name=name, path_a=path_a_map_object, path_b=path_b_map_object)

    # assigned_stops points
    # map_point_object_type = ObjectType.objects.get_or_create(name="Point")[0]


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
