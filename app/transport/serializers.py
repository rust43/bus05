from rest_framework import serializers
from transport.models import Transport
from transport.models import TransportPoint
from transport.models import TransportType


class TransportPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportPoint
        fields = "__all__"


class TransportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportType
        fields = ["id", "name"]

    id = serializers.UUIDField()


class TransportSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField()

    class Meta:
        model = Transport
        fields = ["id", "imei", "name", "license_plate", "active", "transport_type", "route"]
