import uuid

from django.contrib.gis.db import models
from map.models import MapObject
from route.models import Route


class TransportType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)


class Transport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    imei = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=255)
    license_plate = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    transport_type = models.OneToOneField(
        TransportType, on_delete=models.SET_NULL, null=True, blank=True
    )
    location = models.OneToOneField(MapObject, on_delete=models.SET_NULL, null=True, blank=True)
    route = models.ForeignKey(
        Route, related_name="transports", on_delete=models.SET_NULL, null=True, blank=True
    )


class TransportPoint(models.Model):
    imei = models.CharField(max_length=16)
    date = models.DateTimeField()
    lat = models.FloatField()
    lon = models.FloatField()
    speed = models.IntegerField()
    course = models.IntegerField()
    height = models.IntegerField()
    sats = models.IntegerField()
