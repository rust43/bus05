from django.contrib.gis import admin
from django.contrib.gis.forms.widgets import OSMWidget

from .models import MapObject
from .models import MapObjectProp
from .models import ObjectCircle
from .models import ObjectLineString
from .models import ObjectPoint
from .models import ObjectPolygon
from .models import ObjectType


class CustomGeoWidget(OSMWidget):
    template_name = "gis/openlayers-osm.html"


class CustomGeoModelAdmin(admin.GISModelAdmin):
    gis_widget = CustomGeoWidget
    gis_widget_kwargs = {
        "attrs": {
            # "default_zoom": 14,
            # "default_lon": 3.4825,
            # "default_lat": 50.1906,
        },
    }


@admin.register(MapObjectProp)
class PropAdmin(admin.ModelAdmin):
    model = MapObjectProp
    list_display = ("map_object", "prop", "value")
    # list_filter = ("map_object__zone", "map_object__object_type")


@admin.register(ObjectPoint)
class PointAdmin(admin.ModelAdmin):
    model = ObjectPoint
    list_display = ("id", "map_object", "geom")


@admin.register(ObjectCircle)
class CircleAdmin(admin.ModelAdmin):
    model = ObjectCircle
    list_display = ("id", "map_object", "geom")


@admin.register(ObjectLineString)
class LineAdmin(CustomGeoModelAdmin):
    model = ObjectLineString
    list_display = ("id", "map_object", "geom")


@admin.register(ObjectPolygon)
class PolygonAdmin(admin.ModelAdmin):
    model = ObjectPolygon
    list_display = ("id", "map_object", "geom")


# class PointInline(admin.TabularInline):
# model = ObjectPoint


@admin.register(MapObject)
class MapObjectAdmin(admin.ModelAdmin):
    list_display = ("name", "object_type")
    # inlines = [PointInline]


class MapObjectInline(admin.TabularInline):
    model = MapObject


@admin.register(ObjectType)
class ObjectTypeAdmin(admin.ModelAdmin):
    pass
