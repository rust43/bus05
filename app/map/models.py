import uuid

from django.contrib.gis.db import models


class ObjectType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return str(self.name)


class MapObject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    object_type = models.ForeignKey(ObjectType, on_delete=models.SET_NULL, null=True, blank=True)


class ObjectPoint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_object = models.OneToOneField(MapObject, related_name="point", on_delete=models.CASCADE)
    geom = models.PointField("точка", geography=True, null=True, blank=True)


class ObjectCircle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_object = models.OneToOneField(MapObject, related_name="circle", on_delete=models.CASCADE)
    geom = models.PointField(geography=True, null=True, blank=True)


class ObjectPolygon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_object = models.OneToOneField(MapObject, related_name="polygon", on_delete=models.CASCADE)
    geom = models.PolygonField(geography=True, null=True, blank=True)


class ObjectLineString(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_object = models.OneToOneField(MapObject, related_name="line", on_delete=models.CASCADE)
    geom = models.LineStringField(geography=True, null=True, blank=True)


class MapObjectProp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_object = models.ForeignKey(MapObject, related_name="props", on_delete=models.CASCADE)
    prop = models.CharField(max_length=255, null=True, blank=True)
    value = models.CharField(max_length=255, null=True, blank=True)
