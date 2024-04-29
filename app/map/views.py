import os
import sqlite3

from bus05.settings import BASE_DIR
from django.http import HttpResponse
from django.http import HttpResponseNotFound
from django.shortcuts import render


def map_view(request):
    return render(request, "map/map.html", context={})


def serve_tile(request, layer, z, x, y):
    if layer == "2gis":
        mbtiles_path = os.path.join(BASE_DIR, "static/tiles/2gis.mbtiles")
    elif layer == "osm":
        mbtiles_path = os.path.join(BASE_DIR, "static/tiles/osm.mbtiles")
    else:
        return HttpResponseNotFound("Tile not existing on this server.")

    with sqlite3.connect(mbtiles_path) as connection:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT tile_data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?",
            (z, x, y),
        )
        tile = cursor.fetchone()
        if tile:
            return HttpResponse(tile[0], content_type="image/png")
    return HttpResponseNotFound("Tile not existing on this server.")
