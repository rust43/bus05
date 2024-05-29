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

function SaveRoute() {
    let routeId = document.getElementById('selected-route-id').value;
    let route_name = document.getElementById('selected-route-name').value;

    let selectedRoute = GetSelectedRoute(routeId);

    let route_path_a = routesVectorSource.getFeatureById(selectedRoute.path_a.line.id);
    let route_path_b = routesVectorSource.getFeatureById(selectedRoute.path_b.line.id);

    let features = [route_path_a, route_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );
    const route_data = {
        'name': route_name,
        'geojson_data': geoJSONdata,
        'path_a_stops': ConvertBusStopsToDict(selectedRoute.path_a_stops),
        'path_b_stops': ConvertBusStopsToDict(selectedRoute.path_b_stops),
    };
    SaveRouteRequest(route_data).then(function () {
        alert('Изменения сохранены!');
        try {
            LoadRoutes();
        } catch (err) {
            alert('Ошибка при загрузке новых маршрутов!');
        }
    });
}

async function SaveRouteRequest(route_data) {
    const url = host + '/api/v1/route/';
    const response = await fetch(
        url,
        {
            method: 'put',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(route_data)
        });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

function DeleteRoute() {
    let routeId = document.getElementById('selected-route-id').value;
    const route_data = {
        'route_id': routeId,
    };
    DeleteRouteRequest(route_data).then(function () {
        alert('Маршрут удален!');
        try {
            document.getElementById('route-data').classList.add('d-none');
            LoadRoutes();
        } catch (err) {
            alert('Ошибка при загрузке новых маршрутов!');
        }
    });
}

async function DeleteRouteRequest(route_data) {
    const url = host + '/api/v1/route/';
    const response = await fetch(
        url,
        {
            method: 'delete',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(route_data)
        });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

// Select function for path feature id
function SelectPathFeatureByID(pathFeatureId) {
    const pathFeature = routesVectorSource.getFeatureById(pathFeatureId);
    if (!pathFeature) return;
    editMode = 'route-path-edit';
    mapSelectInteraction.getFeatures().clear();
    mapSelectInteraction.getFeatures().push(pathFeature);
    mapSelectInteraction.dispatchEvent({
        type: 'select',
        selected: [pathFeature],
        deselected: []
    });
    PanToFeature(pathFeature);
}

function SelectRouteData(routeId) {
    if (routeId === '') return;
    let selectedRoute = null;
    for (let i = 0; i < loadedRoutes.length; i++) {
        if (loadedRoutes[i].id === routeId) selectedRoute = loadedRoutes[i];
    }
    document.getElementById('route-data').classList.remove('d-none');
    document.getElementById('selected-route-name').value = selectedRoute.name;
    document.getElementById('selected-route-id').value = selectedRoute.id;

    path_a_stops = ConvertBusStopsToDict(selectedRoute.path_a_stops);
    path_b_stops = ConvertBusStopsToDict(selectedRoute.path_b_stops);

    const PathABusStopListContainer = document.getElementById('route-path-a-stops-container');
    const PathBBusStopListContainer = document.getElementById('route-path-b-stops-container');

    FillBusStopsContainer(path_a_stops, PathABusStopListContainer, routeId);
    FillBusStopsContainer(path_b_stops, PathBBusStopListContainer, routeId);

    document.getElementById('show-route-path-a').onclick = function () {
        SelectPathFeatureByID(selectedRoute.path_a.line.id);
    };
    document.getElementById('show-route-path-b').onclick = function () {
        SelectPathFeatureByID(selectedRoute.path_b.line.id);
    };
}

function ConvertBusStopsToDict(array) {
    dict = {};
    for (let i = 0; i < array.length; i++) {
        let element = array[i];
        dict[element.id] = element.name;
    }
    return dict;
}

function FillBusStopsContainer(stops_dict, container, routeId) {
    container.innerHTML = '';
    let busstopBadge = null;
    let busstopBadgeText = null;
    if (Object.keys(stops_dict).length === 0) {
        busstopBadge = document.createElement('SPAN');
        busstopBadgeText = document.createTextNode("Отсутствуют");
        busstopBadge.appendChild(busstopBadgeText);
        busstopBadge.classList.add('badge', 'text-bg-secondary');
        container.appendChild(busstopBadge);
    }
    else {
        for (let key in stops_dict) {
            busstopBadge = document.createElement('SPAN');
            busstopBadgeText = document.createTextNode(stops_dict[key]);
            busstopBadgeButton = document.createElement('BUTTON');
            busstopBadgeButton.classList.add('btn-close', 'ms-1');
            busstopBadge.appendChild(busstopBadgeText);
            busstopBadge.appendChild(busstopBadgeButton);
            busstopBadge.classList.add('badge', 'text-bg-success', 'd-flex', 'align-items-center');
            if (routeId === 'new-route') {
                busstopBadge.onclick = function () {
                    DeleteNewRouteBusStop(key, routeId);
                }
            }
            else {
                busstopBadge.onclick = function () {
                    DeleteRouteBusStop(key, routeId);
                }
            }
            container.appendChild(busstopBadge);
        }
    }
}

function GetSelectedRoute(routeId) {
    for (let i = 0; i < loadedRoutes.length; i++) {
        if (loadedRoutes[i].id === routeId)
            return loadedRoutes[i];
    }
    return null;
}

function DeleteRouteBusStop(busStopId, routeId) {
    let selectedRoute = GetSelectedRoute(routeId);
    for (let i = 0; i < selectedRoute.path_a_stops.length; i++) {
        let stop = selectedRoute.path_a_stops[i];
        if (stop.id === busStopId) {
            selectedRoute.path_a_stops.splice(i, 1);
            break;
        }
    }
    for (let i = 0; i < selectedRoute.path_b_stops.length; i++) {
        let stop = selectedRoute.path_b_stops[i];
        if (stop.id === busStopId) {
            selectedRoute.path_b_stops.splice(i, 1);
            break;
        }
    }
    SelectRouteData(routeId);
}

function SelectRouteBusStopFeature(PathDirection) {
    if (PathDirection === "path-a") {
        editMode = 'route-add-busstop-path-a';
    }
    else if (PathDirection === "path-b") {
        editMode = 'route-add-busstop-path-b';
    }
}

function AddRouteBusstop(BusStopFeature, PathDirection) {
    let routeId = document.getElementById('selected-route-id').value;
    if (!routeId) return;
    let busStopId = BusStopFeature.get('map_object_id');
    let busStopName = BusStopFeature.get('name');
    let selectedRoute = GetSelectedRoute(routeId);

    path_a_stops = ConvertBusStopsToDict(selectedRoute.path_a_stops);
    path_b_stops = ConvertBusStopsToDict(selectedRoute.path_b_stops);

    if (PathDirection === 'path-a') {
        for (let i = 0; i < selectedRoute.path_b_stops.length; i++) {
            let stop = selectedRoute.path_b_stops[i];
            if (stop.id === busStopId) {
                selectedRoute.path_b_stops.splice(i, 1);
                break;
            }
        }

        if (!path_a_stops.hasOwnProperty(busStopId)) {
            selectedRoute.path_a_stops.push({ id: busStopId, name: busStopName });
        }
    }
    else if (PathDirection === 'path-b') {
        for (let i = 0; i < selectedRoute.path_a_stops.length; i++) {
            let stop = selectedRoute.path_a_stops[i];
            if (stop.id === busStopId) {
                selectedRoute.path_a_stops.splice(i, 1);
                break;
            }
        }
        if (!path_b_stops.hasOwnProperty(busStopId)) {
            selectedRoute.path_b_stops.push({ id: busStopId, name: busStopName });
        }
    }
    SelectRouteData(routeId);
}
