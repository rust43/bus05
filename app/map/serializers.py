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
    class Meta:
        model = MapObject
        fields = ["id", "name", "object_type", "point", "circle", "line", "polygon", "props"]

    id = serializers.ReadOnlyField()
    object_type = serializers.CharField(source="object_type.name")
    point = PointSerializer(many=False, required=False)
    circle = CircleSerializer(many=False, required=False)
    line = LineStringSerializer(many=False, required=False)
    polygon = PolygonSerializer(many=False, required=False)
    props = PropSerializer(many=True, required=False)

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
