//
// Route edit functions
//

let editedRoute = null;
let edit_route_path_a_stops = null;
let edit_route_path_b_stops = null;
let PathABusStopListContainer = null;
let PathBBusStopListContainer = null;

//
// Route save functions
//

function SaveRoute() {
    if (editedRoute === null)
        return;

    let route_name = document.getElementById('selected-route-name').value;

    let route_path_a = routesVectorSource.getFeatureById(editedRoute.path_a.line.id);
    let route_path_b = routesVectorSource.getFeatureById(editedRoute.path_b.line.id);

    let features = [route_path_a, route_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );
    const route_data = {
        'name': route_name,
        'geojson_data': geoJSONdata,
        'path_a_stops': edit_route_path_a_stops,
        'path_b_stops': edit_route_path_b_stops,
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

//
// Route delete functions
//

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

//
// Route edit functions
//

// Select function for path feature id
function EditPathFeature(pathFeatureId) {
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

    editedRoute = GetSelectedRoute(routeId);

    document.getElementById('route-data').classList.remove('d-none');
    document.getElementById('selected-route-name').value = editedRoute.name;
    document.getElementById('selected-route-id').value = editedRoute.id;

    edit_route_path_a_stops = ConvertBusStopsToDict(editedRoute.path_a_stops);
    edit_route_path_b_stops = ConvertBusStopsToDict(editedRoute.path_b_stops);

    PathABusStopListContainer = document.getElementById('route-path-a-stops-container');
    PathBBusStopListContainer = document.getElementById('route-path-b-stops-container');

    FillBusStopsContainer(edit_route_path_a_stops, PathABusStopListContainer, false);
    FillBusStopsContainer(edit_route_path_b_stops, PathBBusStopListContainer, false);

    document.getElementById('show-route-path-a').onclick = function () {
        EditPathFeature(editedRoute.path_a.line.id);
    };
    document.getElementById('show-route-path-b').onclick = function () {
        EditPathFeature(editedRoute.path_b.line.id);
    };
}

function FillBusStopsContainer(stopsDict, container, newRoute) {
    container.innerHTML = '';
    let busstopBadge = null;
    let busstopBadgeText = null;
    if (Object.keys(stopsDict).length === 0) {
        busstopBadge = document.createElement('SPAN');
        busstopBadgeText = document.createTextNode("Отсутствуют");
        busstopBadge.appendChild(busstopBadgeText);
        busstopBadge.classList.add('badge', 'text-bg-secondary');
        container.appendChild(busstopBadge);
    }
    else {
        for (let key in stopsDict) {
            busstopBadge = document.createElement('SPAN');
            busstopBadgeText = document.createTextNode(stopsDict[key]);
            busstopBadgeButton = document.createElement('BUTTON');
            busstopBadgeButton.classList.add('btn-close', 'ms-1');
            busstopBadge.appendChild(busstopBadgeText);
            busstopBadge.appendChild(busstopBadgeButton);
            busstopBadge.classList.add('badge', 'text-bg-success', 'd-flex', 'align-items-center');
            if (newRoute) {
                busstopBadge.onclick = function () {
                    DeleteNewRouteBusStop(key);
                }
            }
            else {
                busstopBadge.onclick = function () {
                    DeleteRouteBusStop(key);
                }
            }
            container.appendChild(busstopBadge);
        }
    }
}

function DeleteRouteBusStop(busStopId) {
    delete edit_route_path_a_stops[busStopId];
    delete edit_route_path_b_stops[busStopId];
    FillBusStopsContainer(edit_route_path_a_stops, PathABusStopListContainer, false);
    FillBusStopsContainer(edit_route_path_b_stops, PathBBusStopListContainer, false);
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
    if (PathDirection === 'path-a') {
        delete edit_route_path_b_stops[BusStopFeature.get('map_object_id')];
        edit_route_path_a_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('name');
    }
    else if (PathDirection === 'path-b') {
        delete edit_route_path_a_stops[BusStopFeature.get('map_object_id')];
        edit_route_path_b_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('name');
    }
    FillBusStopsContainer(edit_route_path_a_stops, PathABusStopListContainer, false);
    FillBusStopsContainer(edit_route_path_b_stops, PathBBusStopListContainer, false);
}

//
// Route edit helper functions
//

function ConvertBusStopsToDict(stopsArray) {
    dict = {};
    for (let i = 0; i < stopsArray.length; i++) {
        let element = stopsArray[i];
        dict[element.id] = element.name;
    }
    return dict;
}

function GetSelectedRoute(routeId) {
    for (let i = 0; i < loadedRoutes.length; i++) {
        if (loadedRoutes[i].id === routeId)
            return loadedRoutes[i];
    }
    return null;
}

