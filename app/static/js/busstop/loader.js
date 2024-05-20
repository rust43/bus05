
let busStopsVectorSource = new olVectorSource({ wrapX: false });
let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: setFeatureStyle });
map.addLayer(busStopsVectorLayer);

let loadedBusStops = null;

function LoadBusStops() {
    GetBusStops().then(busStops => {
        DisplayBusStops(busStops);
    });
}

async function GetBusStops() {
    const url = host + "/api/v1/busstop/";
    let response = await fetch(
        url,
        {
            method: "get",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json", "Content-Type": "application/json"
            },
        });
    if (response.ok) {
        return await response.json();
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}

function DisplayBusStops(busStops) {
    loadedBusStops = busStops;
    for (let i = 0; i < busStops.length; i++) {
        const busStop = busStops[i];
        console.log(busStop);


        // DisplayPath(route["path_a"].line.id, route["name"], route["path_a"].line.geom);
        // DisplayPath(route["path_b"].line.id, route["name"], route["path_b"].line.geom);
    }
}

function DisplayPath(id, name, geomLine) {
    let coordinates = new olLineStringGeometry(geomLine.coordinates);
    coordinates = coordinates.transform("EPSG:4326", "EPSG:3857");
    const routeFeature = new olFeature({
        geometry: coordinates, type: geomLine.type, name: name,
    });
    routeFeature.setId(id);
    routeFeature.set("type", "path");
    routesVectorSource.addFeature(routeFeature);
}

LoadBusStops();
