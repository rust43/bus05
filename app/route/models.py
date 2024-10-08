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

    def __str__(self):
        return f"{self.name}"


class RouteType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)


class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    route_type = models.ForeignKey(RouteType, on_delete=models.SET_NULL, null=True, blank=True)
    path_a = models.OneToOneField(MapObject, related_name="path_a", on_delete=models.SET_NULL, null=True, blank=True)
    path_a_stops = models.ManyToManyField(BusStop, related_name="path_a_stops", through="BusStopOrderA", blank=True)
    path_b = models.OneToOneField(MapObject, related_name="path_b", on_delete=models.SET_NULL, null=True, blank=True)
    path_b_stops = models.ManyToManyField(BusStop, related_name="path_b_stops", through="BusStopOrderB", blank=True)

    def __str__(self):
        return f"{self.name}"

    def busstops_a_list(self):
        return [route.busstop for route in BusStopOrderA.objects.filter(route=self).order_by("order")]

    def busstops_b_list(self):
        return [route.busstop for route in BusStopOrderB.objects.filter(route=self).order_by("order")]

    class Meta:
        ordering = ["name"]


class BusStopOrderA(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    busstop = models.ForeignKey(BusStop, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        ordering = ["order"]


class BusStopOrderB(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    busstop = models.ForeignKey(BusStop, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        ordering = ["order"]
