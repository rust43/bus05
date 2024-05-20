
let routesVectorSource = new olVectorSource({ wrapX: false });
let routesVectorLayer = new olVectorLayer({ source: routesVectorSource, style: setFeatureStyle });
map.addLayer(routesVectorLayer);

let loadedRoutes = null;

function LoadRoutes() {
    GetRoutes().then(routes => {
        DisplayRoutes(routes);
    });
}

async function GetRoutes() {
    const url = host + "/api/v1/routes/";
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

function DisplayRoutes(routes) {
    loadedRoutes = routes;
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        DisplayPath(route["path_a"].line.id, route["name"], route["path_a"].line.geom);
        DisplayPath(route["path_b"].line.id, route["name"], route["path_b"].line.geom);
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

LoadRoutes();
