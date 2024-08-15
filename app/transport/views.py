from bus05.permissions import HasGroupPermission
from rest_framework import authentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from route.models import Route
from transport.models import Transport
from transport.models import TransportPoint
from transport.models import TransportType
from transport.serializers import TransportTypeSerializer
from transport.serializers import TransportSerializer


class ListTransportIMEI(APIView):
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


class ListTransportTypes(APIView):
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

        transport = Transport(
            imei=imei,
            name=name,
            license_plate=license_plate,
            active=active,
            transport_type=transport_type,
            route=route,
        )
        transport.save()

        return Response(status=status.HTTP_201_CREATED)

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit Transport data
        """

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete Transport
        """
