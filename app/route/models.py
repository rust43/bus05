import uuid

from django.contrib.gis.db import models
from map.models import MapObject


class City(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    center_point = models.OneToOneField(MapObject, on_delete=models.SET_NULL, null=True, blank=True)


class BusStop(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    city = models.OneToOneField(City, related_name="city", on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    location = models.OneToOneField(MapObject, on_delete=models.SET_NULL, null=True, blank=True)


class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    assigned_stops = models.ManyToManyField(BusStop, related_name="routes", blank=True)
    path_a = models.OneToOneField(MapObject, related_name="path_a", on_delete=models.SET_NULL, null=True, blank=True)
    path_b = models.OneToOneField(MapObject, related_name="path_b", on_delete=models.SET_NULL, null=True, blank=True)


class TransportType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)


class Transport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    transport_type = models.OneToOneField(TransportType, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.OneToOneField(MapObject, on_delete=models.SET_NULL, null=True, blank=True)
    route = models.ForeignKey(Route, related_name="transports", on_delete=models.SET_NULL, null=True, blank=True)
