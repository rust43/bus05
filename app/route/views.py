from bus05.permissions import HasGroupPermission
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from route.functions import consolidate_import
from route.functions import parse_geojson
from route.models import BusStop
from route.models import Route
from route.models import RouteType
from route.serializers import BusStopSerializer
from route.serializers import RouteSerializer
from route.serializers import RouteTypeSerializer


class RouteApiView(APIView):
    permission_classes = [HasGroupPermission]

    required_groups = {
        "GET": ["__all__"],
        "POST": ["map_admin"],
        "PUT": ["map_admin"],
        "DELETE": ["map_admin"],
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
        map_data = parse_geojson(geojson)["new"]

        route_type = request.data.get("route_type")
        try:
            route_type = RouteType.objects.get(pk=route_type)
        except (RouteType.DoesNotExist, ValidationError):
            route_type = route_type.capitalize()
            route_type = RouteType.objects.create(name=route_type)

        if not map_data:
            Response(status=status.HTTP_400_BAD_REQUEST)

        route = Route(name=name, route_type=route_type)
        # path data parse
        for path, line in map_data:
            if "path-a" in str(path.name):
                path.name = "route-" + str(route.id) + "-path-a"
                path.save()
                line.save()
                route.path_a = path
            elif "path-b" in str(path.name):
                path.name = "route-" + str(route.id) + "-path-b"
                path.save()
                line.save()
                route.path_b = path
            else:
                continue
        route.save()
        # busstop data parse
        for busstop_data in path_a_stops:
            try:
                busstop = BusStop.objects.get(pk=busstop_data["id"])
            except ValidationError:
                continue
            route.path_a_stops.add(busstop)
        for busstop_data in path_b_stops:
            try:
                busstop = BusStop.objects.get(pk=busstop_data["id"])
            except ValidationError:
                continue
            route.path_b_stops.add(busstop)
        route.save()
        return Response(status=status.HTTP_201_CREATED)

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit Route data
        """
        name = request.data.get("name")
        geojson = request.data.get("geojson_data")
        path_a_stops = request.data.get("path_a_stops")
        path_b_stops = request.data.get("path_b_stops")

        route_type = request.data.get("route_type")
        try:
            route_type = RouteType.objects.get(pk=route_type)
        except (RouteType.DoesNotExist, ValidationError):
            route_type = route_type.capitalize()
            route_type = RouteType.objects.create(name=route_type)

        map_data = parse_geojson(geojson)
        if not map_data:
            Response(status=status.HTTP_400_BAD_REQUEST)

        for route_data in map_data.items():
            try:
                route = Route.objects.get(pk=route_data[0])
            except Route.DoesNotExist:
                Response(status=status.HTTP_400_BAD_REQUEST)
            for path, line in route_data[1]:
                if "path-a" in str(path.name):
                    if route.path_a:
                        route.path_a.delete()
                    path.save()
                    line.save()
                    route.path_a = path
                elif "path-b" in str(path.name):
                    if route.path_b:
                        route.path_b.delete()
                    path.save()
                    line.save()
                    route.path_b = path
            route.name = name
            route.route_type = route_type
            route.save()
            # busstop data parse
            route.path_a_stops.clear()
            for busstop_data in path_a_stops:
                try:
                    busstop = BusStop.objects.get(pk=busstop_data["id"])
                except BusStop.DoesNotExist:
                    continue
                route.path_a_stops.add(busstop)
            route.path_b_stops.clear()
            for busstop_data in path_b_stops:
                try:
                    busstop = BusStop.objects.get(pk=busstop_data["id"])
                except BusStop.DoesNotExist:
                    continue
                route.path_b_stops.add(busstop)
            route.save()
        return Response(status=status.HTTP_200_OK)

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete Route
        """
        route_id = request.data.get("route_id")
        try:
            route = Route.objects.get(pk=route_id)
            if route.path_a:
                route.path_a.delete()
            if route.path_b:
                route.path_b.delete()
            route.delete()
            return Response(status=status.HTTP_200_OK)
        except Route.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class BusStopApiView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["__all__"],
        "POST": ["map_admin"],
        "PUT": ["map_admin"],
        "DELETE": ["map_admin"],
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
        map_data = parse_geojson(geojson)["new"]

        if map_data:
            busstop = BusStop(name=name)
            location, point = map_data[0]
            location.name = "busstop-" + str(busstop.id)
            location.save()
            point.save()
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
            busstop_id = next(iter(map_data))
            location, point = map_data[busstop_id][0]
            try:
                busstop = BusStop.objects.get(pk=busstop_id)
            except BusStop.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            if busstop.location:
                busstop.location.delete()
            location.save()
            point.save()
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
            if busstop.location:
                busstop.location.delete()
            busstop.delete()
            return Response(status=status.HTTP_200_OK)
        except BusStop.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class DataApiView(APIView):
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["map_admin"],
        "POST": ["map_admin"],
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
            "routes": RouteSerializer(routes, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Import new data to system
        """
        file = request.data.get("file")
        data = JSONParser().parse(file)
        # consolidation
        data = consolidate_import(data)
        if len(data["busstops"]) > 0:
            imported_busstops = BusStopSerializer(data=data["busstops"], many=True, allow_empty=True)
            imported_busstops_valid = imported_busstops.is_valid()
        else:
            imported_busstops = None
            imported_busstops_valid = True
        if len(data["routes"]) > 0:
            imported_routes = RouteSerializer(data=data["routes"], many=True)
            imported_routes_valid = imported_routes.is_valid()
        else:
            imported_routes = None
            imported_routes_valid = True
        valid = bool(imported_busstops_valid) * bool(imported_routes_valid)
        if not valid:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if imported_busstops:
            imported_busstops.save()
        if imported_routes:
            imported_routes.save()
        return Response(status=status.HTTP_200_OK)


class RouteTypeAPIView(APIView):
    authentication_classes = ()
    permission_classes = ()

    @staticmethod
    def get(request):
        type_list = RouteType.objects.all()
        serializer = RouteTypeSerializer(type_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
