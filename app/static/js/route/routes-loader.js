
let routesVectorSource = new olVectorSource({ wrapX: false });
let routesVectorLayer = new olVectorLayer({ source: routesVectorSource, style: DefaultRouteStyleFunction });
map.addLayer(routesVectorLayer);

function DefaultRouteStyleFunction(feature) {
    if (!feature) return;
    const strokeColor = '#308C00';
    const strokeWidth = 3;
    const stroke = new olStrokeStyle({ color: strokeColor, width: strokeWidth });
    const styles = [new olStyle({ stroke: stroke })];
    feature.setStyle(styles);
    feature.changed();
}

function LoadRoutes() {
    GetRoutes().then(routes => {
        DrawRoutes(routes);
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

function DrawRoutes(routes) {

    console.log(routes);

    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        DrawPath(route["id"], route["name"], route["path_a"].line.geom);
        DrawPath(route["id"], route["name"], route["path_b"].line.geom);
    }
}

function DrawPath(id, name, geomLine) {
    let coordinates = new olLineStringGeometry(geomLine.coordinates);
    coordinates = coordinates.transform("EPSG:4326", "EPSG:3857");
    const routeFeature = new olFeature({
        geometry: coordinates, type: geomLine.type, name: name,
    });
    routeFeature.set("db_id", id);
    routeFeature.set("arrow", "true");
    routeFeature.setStyle(DefaultRouteStyleFunction);
    routesVectorSource.addFeature(routeFeature);
}

LoadRoutes();
