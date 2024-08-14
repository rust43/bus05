from rest_framework import serializers
from transport.models import TransportType


class TransportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportType
        fields = ["id", "name"]

    id = serializers.UUIDField()
