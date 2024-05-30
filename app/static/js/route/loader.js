let routesVectorSource = new olVectorSource({ wrapX: false });
let routesVectorLayer = new olVectorLayer({ source: routesVectorSource, style: mapStyleFunction });
map.addLayer(routesVectorLayer);

let loadedRoutes = null;

function LoadRoutes() {
    GetRoutes().then(routes => {
        loadedRoutes = routes;
        routesVectorSource.clear();
        DisplayRoutes(routes);
    });
}

async function GetRoutes() {
    const url = host + '/api/v1/route/';
    let response = await fetch(url, {
        method: 'get', credentials: 'same-origin', headers: {
            'Accept': 'application/json', 'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

function DisplayRoutes(routes) {
    const routeListContainer = document.getElementById('route-list');
    if (routeListContainer)
        routeListContainer.innerHTML = '';
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        DisplayPath(
            route.path_a.line.id,
            route.id,
            'route-' + route.id + '-path-a',
            route.path_a.line.geom
        );
        DisplayPath(
            route.path_b.line.id,
            route.id,
            'route-' + route.id + '-path-b',
            route.path_b.line.geom);
        // add button to view route
        const routeButton = document.createElement('BUTTON');
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

function DisplayPath(id, route_id, name, geom) {
    let coordinates = new olLineStringGeometry(geom.coordinates);
    coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
    const routeFeature = new olFeature({
        geometry: coordinates, type: geom.type, name: name
    });
    routeFeature.setId(id);
    routeFeature.set('type', 'path');
    routeFeature.set('map_object_id', route_id);
    routesVectorSource.addFeature(routeFeature);
}

LoadRoutes();
