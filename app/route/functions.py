import json

from django.contrib.gis.geos import LineString
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from map.models import MapObject
from map.models import ObjectCircle
from map.models import ObjectLineString
from map.models import ObjectPoint
from map.models import ObjectPolygon
from map.models import ObjectType


def parse_point(name: str, geometry_type: str, geom: Point) -> tuple[MapObject, ObjectPoint]:
    map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
    map_object = MapObject(name=name, object_type=map_object_type)
    point = ObjectPoint(map_object=map_object, geom=geom)
    return map_object, point


def parse_path(name: str, geometry_type: str, geom: LineString) -> tuple[MapObject, ObjectLineString]:
    map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
    map_object = MapObject(name=name, object_type=map_object_type)
    line = ObjectLineString(map_object=map_object, geom=geom)
    return map_object, line


def parse_map_object(
    name: str, geometry_type: str, coordinates: list
) -> tuple[MapObject | None, ObjectPoint | ObjectLineString | ObjectCircle | ObjectPolygon | None]:
    map_object_type = ObjectType.objects.get_or_create(name=geometry_type)[0]
    map_object = MapObject(name=name, object_type=map_object_type)
    child_object = None
    geom = None
    if geometry_type == "Point":
        coordinates = list(map(float, coordinates))
        geom = Point((coordinates[0], coordinates[1]), srid=4326)
        child_object = ObjectPoint(map_object=map_object, geom=geom)
    elif geometry_type == "LineString":
        for coordinate in coordinates:
            coordinate = list(map(float, coordinate))
        geom = LineString(coordinates, srid=4326)
        child_object = ObjectLineString(map_object=map_object, geom=geom)
    elif geometry_type == "Circle":
        coordinates = list(map(float, coordinates))
        geom = Point((coordinates[0], coordinates[1]), srid=4326)
        child_object = ObjectCircle.objects.create(map_object=map_object, geom=geom)
    elif geometry_type == "Polygon":
        for coordinate in coordinates[0]:
            coordinate = list(map(float, coordinate))
        geom = Polygon(coordinates[0], srid=4326)
        child_object = ObjectPolygon.objects.create(map_object=map_object, geom=geom)
    return map_object, child_object


def parse_geojson(
    features: str,
) -> dict[str, list[tuple[MapObject, ObjectPoint | ObjectLineString | ObjectCircle | ObjectPolygon]]]:
    data = json.loads(features)
    parsed_features = {}
    for feature in data["features"]:
        name = feature["properties"]["name"]
        coordinates = feature["geometry"]["coordinates"]
        geometry_type = feature["geometry"]["type"]

        # check if object newly created or exists in database
        if feature["properties"].get("map_object_id"):
            map_object_id = feature["properties"]["map_object_id"]
        else:
            map_object_id = "new"

        map_object, child_object = parse_map_object(name, geometry_type, coordinates)

        if parsed_features.get(map_object_id):
            parsed_features[map_object_id].append([map_object, child_object])
        else:
            parsed_features[map_object_id] = [[map_object, child_object]]
        # parsing props
        # for prop, value in feature["properties"].items():
        #     MapObjectProp.objects.create(map_object=map_object, prop=prop, value=value)
    return parsed_features
