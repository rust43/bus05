//
// Route layer loader file
//

// openlayers layers definition
let routeVectorSource = new olVectorSource({ wrapX: false });
let routeVectorLayer = new olVectorLayer({ source: routeVectorSource, style: mapStyleFunction });

// openlayers adding routes layer
map.addLayer(routeVectorLayer);

// var to keep loaded route list
let loadedRoutes = null;

async function LoadRoutes() {
    loadedRoutes = await APIGetRequest(routeAPI.main);
}

LoadRoutes();

async function FillRouteList() {
    document.getElementById('route-data').classList.add('d-none');
    await LoadRoutes();
    const routeListContainer = document.getElementById('route-list');
    if (routeListContainer) routeListContainer.innerHTML = '';
    else return;
    for (let i = 0; i < loadedRoutes.length; i++) {
        const route = loadedRoutes[i];
        // add button to view transport
        const routeButton = document.createElement('button');
        const routeButtonText = document.createTextNode(route.name);
        if (routeListContainer) {
            routeButton.appendChild(routeButtonText);
            routeButton.classList.add('btn', 'badge', 'text-bg-success');
            routeButton.onclick = function () {
                SelectRouteData(route.id);
            };
            routeListContainer.appendChild(routeButton);
        }
    }
}

function DisplayRoute(routeID) {
    routeVectorSource.clear();
    const route = GetRoute(routeID);
    if (route === null) return;
    DisplayRoutePath(
        route.path_a.line.id,
        route.id,
        'route-' + route.id + '-path-a',
        route.path_a.line.geom
    );
    DisplayRoutePath(
        route.path_b.line.id,
        route.id,
        'route-' + route.id + '-path-b',
        route.path_b.line.geom);
}

function DisplayAllRoutes() {
    routeVectorSource.clear();
    if (loadedRoutes.length === 0) return;
    for (let i = 0; i < loadedRoutes.length; i++) {
        const route = loadedRoutes[i];
        DisplayRoutePath(
            route.path_a.line.id,
            route.id,
            'route-' + route.id + '-path-a',
            route.path_a.line.geom
        );
        DisplayRoutePath(
            route.path_b.line.id,
            route.id,
            'route-' + route.id + '-path-b',
            route.path_b.line.geom);
    }
}

function DisplayRoutePath(id, route_id, name, geom) {
    let coordinates = new olLineStringGeometry(geom.coordinates);
    coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
    const routeFeature = new olFeature({
        geometry: coordinates, type: geom.type, name: name
    });
    routeFeature.setId(id);
    routeFeature.set('type', 'path');
    routeFeature.set('map_object_id', route_id);
    routeVectorSource.addFeature(routeFeature);
}


// helper functions

function GetRoute(routeID) {
    if (loadedRoutes === null) return null;
    for (let i = 0; i < loadedRoutes.length; i++) {
        if (loadedRoutes[i].id === routeID) return loadedRoutes[i];
    }
    return null;
}

function ClearRouteLayer() {
    routeVectorSource.clear();
}