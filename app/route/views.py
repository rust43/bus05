import json

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotFound
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

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
        route_geojson_data = request.POST.get("routeGeoJSONData", "")
        # process geoJSON drawn route features data
        # process_geo_json(route_geojson_data, route_id)
        data = {
            "name": request.data.get("name"),
            "path_a": request.data.get("path_a"),
            "path_b": request.data.get("path_b"),
            "borderline": request.data.get("borderline"),
            "user": request.user.id,
        }
        serializer = RouteSerializer(data=data)
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
