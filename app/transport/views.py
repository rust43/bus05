from bus05.permissions import HasGroupPermission
from rest_framework import authentication
from rest_framework.response import Response
from rest_framework.views import APIView
from transport.models import TransportPoint
from transport.models import TransportType


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
        Return a list of all transport imei's.
        """
        imei_list = TransportPoint.objects.order_by("imei").values_list("imei", flat=True).distinct()
        return Response(imei_list)


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
        type_list = TransportType.objects.all().order_by("name").values_list()
        return Response(type_list)


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
        # stops = BusStop.objects.all()
        # serializer = BusStopSerializer(stops, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new Transport
        """

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
