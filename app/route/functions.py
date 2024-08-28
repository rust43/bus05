import json

from django.contrib.gis.geos import LineString
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from django.contrib.gis.measure import Distance
from map.models import MapObject
from map.models import ObjectCircle
from map.models import ObjectLineString
from map.models import ObjectPoint
from map.models import ObjectPolygon
from map.models import ObjectType
from route.models import BusStop
from route.models import Route


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


def consolidate_import(data):
    # dict for keep replace busstop list
    switch_bs = {}
    bus_stops_distinct = {}

    # finding existing busstop id's by coordinates
    busstops = data["busstops"]
    for busstop in busstops:
        name = busstop["name"]
        coordinates = busstop["location"]["point"]["geom"]["coordinates"]
        # removing same coordinates and names busstops
        if bus_stops_distinct.get(name) is not None:
            if bus_stops_distinct[name] == coordinates:
                busstop["exist_id"] = True
                continue
        bus_stops_distinct[name] = coordinates
        point = Point(coordinates)
        # finding point in distance of two meters
        existing_points = ObjectPoint.objects.filter(geom__distance_lt=(point, Distance(m=2)))
        for existing_point in existing_points:
            # getting point map_object
            mo = existing_point.map_object
            # finding busstops with that map object
            try:
                existing_bs = BusStop.objects.get(location=mo)
                busstop["exist_id"] = True
                switch_bs[busstop["id"]] = str(existing_bs.id)
            except BusStop.DoesNotExist:
                continue

    # removing existing routes from import
    routes = data["routes"]
    new_routes = []
    for route in routes:
        name = route["name"]
        try:
            Route.objects.get(name=name)
        except Route.DoesNotExist:
            new_routes.append(route)
    routes = new_routes

    # replacing route busstops with existings values
    for route in routes:
        path_a_stops = route["path_a_stops"]
        for bs in path_a_stops:
            if switch_bs.get(bs["id"]) is not None:
                bs["id"] = switch_bs[bs["id"]]

        path_b_stops = route["path_b_stops"]
        for bs in path_b_stops:
            if switch_bs.get(bs["id"]) is not None:
                bs["id"] = switch_bs[bs["id"]]

    # remove existing busstops
    new_busstops = []
    for busstop in busstops:
        if "exist_id" not in busstop:
            new_busstops.append(busstop)
    busstops = new_busstops

    data["busstops"] = busstops
    data["routes"] = routes
    return data
