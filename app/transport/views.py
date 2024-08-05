from rest_framework.views import APIView
from rest_framework.response import Response
from bus05.permissions import HasGroupPermission
from rest_framework import authentication, permissions
from transport.models import TransportPoint


class ListTransportIMEI(APIView):
    """
    View to list all transport imei's.
    """
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [HasGroupPermission]
    required_groups = {"GET": ["map_admins"]}

    @staticmethod
    def get(request):
        """
        Return a list of all transport imei's.
        """
        imei_list = TransportPoint.objects.order_by('imei').values_list('imei', flat=True).distinct()
        return Response(imei_list)


class TransportApiView(APIView):
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
        List all Transport
        """
        pass
        # stops = BusStop.objects.all()
        # serializer = BusStopSerializer(stops, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def post(request, *args, **kwargs):
        """
        Create new Transport
        """
        pass

    @staticmethod
    def put(request, *args, **kwargs):
        """
        Edit Transport data
        """
        pass

    @staticmethod
    def delete(request, *args, **kwargs):
        """
        Delete Transport
        """
        pass
