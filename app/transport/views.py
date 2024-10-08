from bus05.permissions import HasGroupPermission
from rest_framework import authentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from route.models import Route
from transport.functions import transport_direction
from transport.models import Transport
from transport.models import TransportPoint
from transport.models import TransportType
from transport.serializers import TransportPointSerializer
from transport.serializers import TransportSerializer
from transport.serializers import TransportTypeSerializer


class TransportIMEIAPIView(APIView):
    """
    View to list all transport imei's.
    """

    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["map_admin"],
    }

    @staticmethod
    def get(request):
        """
        Return a list of all unoccupied transport imei's.
        """
        occupied_imei_list = Transport.objects.all().values_list("imei")
        imei_list = TransportPoint.objects.order_by("imei").values_list("imei", flat=True).distinct()
        list_diff = imei_list.difference(occupied_imei_list)
        return Response(list_diff)


class TransportTypeAPIView(APIView):
    """
    View to list all transport types.
    """

    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [HasGroupPermission]
    required_groups = {
        "GET": ["__all__"],
    }

    @staticmethod
    def get(request):
        """
        Return a list of all transport types.
        """
        type_list = TransportType.objects.all()
        serializer = TransportTypeSerializer(type_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TransportPointAPIView(APIView):
    """
    View to get last transport point for imei or for list of imes's.
    """

    permission_classes = ()
    authentication_classes = ()

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Return a list of last transport point for provided imei's.
        """
        imei = request.data.get("imei")
        points = []

        if isinstance(imei, list):
            for i in imei:
                points.append(TransportPoint.objects.filter(imei=i).last())
        elif isinstance(imei, str):
            points = TransportPoint.objects.filter(imei=imei).last()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer = TransportPointSerializer(points, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TransportApiView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
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
        List all Transport
        """
        transports = Transport.objects.all()
        serializer = TransportSerializer(transports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new Transport
        """
        imei = request.data.get("imei")
        name = request.data.get("name")
        license_plate = request.data.get("license_plate")
        active = request.data.get("active")
        transport_type = request.data.get("transport_type")
        new_transport_type = request.data.get("new_transport_type")
        route = request.data.get("route")

        if new_transport_type:
            transport_type = TransportType(name=transport_type)
            transport_type.save()
        else:
            try:
                transport_type = TransportType.objects.get(pk=transport_type)
            except TransportType.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            route = Route.objects.get(pk=route)
        except Route.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        Transport.objects.create(
            imei=imei,
            name=name,
            license_plate=license_plate,
            active=active,
            transport_type=transport_type,
            route=route,
        )
        return Response(status=status.HTTP_201_CREATED)

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit Transport data
        """
        transport_id = request.data.get("transport_id")
        try:
            transport = Transport.objects.get(pk=transport_id)
        except Transport.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        transport.imei = request.data.get("imei")
        transport.name = request.data.get("name")
        transport.license_plate = request.data.get("license_plate")
        transport.active = request.data.get("active")
        transport_type = request.data.get("transport_type")
        if request.data.get("new_transport_type"):
            transport_type = TransportType.objects.create(name=transport_type)
        else:
            try:
                transport_type = TransportType.objects.get(pk=transport_type)
            except TransportType.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        transport.transport_type = transport_type

        try:
            route = Route.objects.get(pk=request.data.get("route"))
        except Route.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        transport.route = route
        transport.save()

        return Response(status=status.HTTP_201_CREATED)

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete Transport
        """
        transport_id = request.data.get("transport_id")
        try:
            transport = Transport.objects.get(pk=transport_id)
            transport.delete()
            return Response(status=status.HTTP_200_OK)
        except Transport.DoesNotExist:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class TransportDirectionAPIView(APIView):
    permission_classes = ()
    authentication_classes = ()

    @staticmethod
    def get(request):
        transport = Transport.objects.get(imei=863051062933345)
        direction = transport_direction(transport)
        data = {"direction": direction}
        return Response(data, status=status.HTTP_200_OK)
