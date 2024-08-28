import sys
import json
from uuid import uuid4

# input_file_name = "100a.json"
input_file_name = sys.argv[1]
# output_file_name = "100a_exp.json"
output_file_name = input_file_name.replace(".json", "")
output_file_name = output_file_name + "_exp.json"

with open(input_file_name, encoding="utf-8") as json_file:
    data = json.load(json_file)


# help functions
def create_busstop(name, coordinates):
    busstop_id = str(uuid4())
    busstop = {
        "id": busstop_id,
        "name": name,
        "location": {
            "id": str(uuid4()),
            "name": "busstop-" + busstop_id,
            "object_type": "Point",
            "point": {
                "id": str(uuid4()),
                "geom": {
                    "type": "Point",
                    "coordinates": coordinates,
                },
            },
        },
    }
    return busstop


def create_route(name, path_a_points, path_b_points, path_a_stops, path_b_stops):
    route_id = str(uuid4())
    route = {
        "id": route_id,
        "name": name,
        "path_a": {
            "id": str(uuid4()),
            "name": "route-" + route_id,
            "object_type": "LineString",
            "line": {
                "id": str(uuid4()),
                "geom": {
                    "type": "LineString",
                    "coordinates": path_a_points,
                },
            },
        },
        "path_b": {
            "id": str(uuid4()),
            "name": "route-" + route_id,
            "object_type": "LineString",
            "line": {
                "id": str(uuid4()),
                "geom": {
                    "type": "LineString",
                    "coordinates": path_b_points,
                },
            },
        },
        "path_a_stops": path_a_stops,
        "path_b_stops": path_b_stops,
    }
    return route


# parse routine

routes = []
busstops = []

forward = True
path_a = {
    "points": [],
    "busstops": [],
}
path_b = {
    "points": [],
    "busstops": [],
}

for feature in data["data"]["features"]:
    for f in feature["features"]:
        if forward:
            path = path_a
        else:
            path = path_b
        if "id" in f:
            # busstop
            busstop = create_busstop(f["name"], f["coordinates"])
            path["busstops"].append({"id": busstop["id"], "name": busstop["name"]})
            busstops.append(busstop)
        else:
            # route point
            for point in f["points"]:
                path["points"].append(point)
    props = feature["properties"]
    meta = props["ThreadMetaData"]
    forward = False

route = create_route(
    meta["name"],
    path_a["points"],
    path_b["points"],
    path_a["busstops"],
    path_b["busstops"],
)

data = {
    "busstops": busstops,
    "routes": [route],
}

with open(output_file_name, "w", encoding="utf-8") as json_file:
    json.dump(data, json_file)
