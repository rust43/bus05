from django.contrib.gis.geos import LineString
from django.contrib.gis.geos import Point
from transport.models import Transport
from transport.models import TransportPoint


def check_path_direction(distance_list: list[float], tolerance: int = 0) -> bool:
    if len(distance_list) == 0:
        return False
    direction = 0
    dir_switch_count = 1 + tolerance
    marker = distance_list[0]
    for distance in distance_list[1:]:
        diff = distance - marker
        if diff > 0:
            new_dir = 1
        elif diff < 0:
            new_dir = -1
        else:
            new_dir = 0
        if new_dir != direction:
            if dir_switch_count == 0:
                return False
            dir_switch_count -= 1
            direction = new_dir
        marker = distance
    return True


def get_line_path_distances(line, path) -> list[float]:
    if path.empty:
        return []
    distances = []
    buffer_width = 60
    buffer_line = line.buffer(buffer_width)
    cut_path = buffer_line.intersection(path)
    cut_path.reverse()
    for point in line.coords:
        point = Point(point)
        distances.append(cut_path.project_normalized(point))  # pylint: disable=maybe-no-member
    return distances


def transport_direction(transport: Transport) -> str:
    route = transport.route
    path_a = route.path_a.line.geom  # type: ignore
    path_b = route.path_b.line.geom  # type: ignore

    points = TransportPoint.objects.filter(imei=transport.imei).order_by("-id")[:7]
    points = points.values_list("lon", "lat")
    points = tuple(e for e in points)
    line = LineString(points)

    line.srid = 4326
    line.transform(3857)
    path_a.transform(3857)
    path_b.transform(3857)

    distances_a = get_line_path_distances(line, path_a)
    distances_b = get_line_path_distances(line, path_b)

    if check_path_direction(distances_a, 1):
        return "path-a"
    if check_path_direction(distances_b, 1):
        return "path-b"
    return "none"
