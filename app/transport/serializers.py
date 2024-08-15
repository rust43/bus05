from rest_framework import serializers
from transport.models import Transport
from transport.models import TransportType


class TransportTypeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField()

    class Meta:
        model = TransportType
        fields = ["id", "name"]


class TransportSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField()

    class Meta:
        model = Transport
        fields = ["id", "imei", "name", "license_plate", "active", "transport_type", "route"]
