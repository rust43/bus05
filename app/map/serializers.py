from rest_framework import serializers

from .models import MapObject
from .models import MapObjectProp
from .models import ObjectCircle
from .models import ObjectLineString
from .models import ObjectPoint
from .models import ObjectPolygon


class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectPoint
        fields = ["id", "geom"]


class CircleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectCircle
        fields = ["id", "geom"]


class LineStringSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectLineString
        fields = ["id", "geom"]


class PolygonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectPolygon
        fields = ["id", "geom"]


class PropSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapObjectProp
        fields = ["prop", "value"]


class MapObjectSerializer(serializers.ModelSerializer):
    object_type = serializers.CharField(source="object_type.name")
    point = PointSerializer(many=False, read_only=True)
    circle = CircleSerializer(many=False, read_only=True)
    line = LineStringSerializer(many=False, read_only=True)
    polygon = PolygonSerializer(many=False, read_only=True)
    props = PropSerializer(many=True, read_only=True)

    class Meta:
        model = MapObject
        fields = ["name", "object_type", "point", "circle", "line", "polygon", "props"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data["point"] is None:
            data.pop("point")
        if data["circle"] is None:
            data.pop("circle")
        if data["polygon"] is None:
            data.pop("polygon")
        if data["line"] is None:
            data.pop("line")
        if len(data["props"]) == 0:
            data.pop("props")
        return data
