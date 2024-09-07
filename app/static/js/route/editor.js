//
// Route edit functions
//

let editedRoute = null;
let edit_route_path_a_stops = null;
let edit_route_path_b_stops = null;
let pathABusStopList = null;
let pathBBusStopList = null;

const editRouteInterface = {
    id: document.getElementById('selected-route-id'),
    type: document.getElementById('selected-route-type'),
    name: document.getElementById('selected-route-name'),
    typeChk: document.getElementById('selected-route-type-chk'),
    typeSelect: document.getElementById('selected-route-type-select'),
    typeField: document.getElementById('selected-route-type-field')
};

//
// Route save functions
//

function SaveRoute() {
    if (editedRoute === null) return;
    if (!RouteEditFormValidation()) {
        alert('Проверьте данные редактируемого маршрута!');
        return;
    }
    let route_name = editRouteInterface.name;
    let route_path_a = routeVectorSource.getFeatureById(editedRoute.path_a.line.id);
    let route_path_b = routeVectorSource.getFeatureById(editedRoute.path_b.line.id);
    if (route_path_a === null || route_path_b === null) {
        alert('Укажите направления маршрута!');
        return;
    }
    let features = [route_path_a, route_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    let route_type;
    let new_route_type = false;
    if (editRouteInterface.typeChk.checked) {
        route_type = editRouteInterface.typeInput.value;
        new_route_type = true;
    } else {
        route_type = editRouteInterface.typeSelect.value;
    }
    const route_data = {
        name: route_name,
        geojson_data: geoJSONdata,
        path_a_stops: edit_route_path_a_stops,
        path_b_stops: edit_route_path_b_stops,
        route_type: route_type,
        new_route_type: new_route_type
    };
    APIPutRequest(route_data, routeAPI.main).then(function () {
        alert('Изменения сохранены!');
        try {
            LoadRoutes().then(function () {
                SelectRouteData(editedRoute.id);
            });
        } catch (err) {
            alert('Ошибка при загрузке данных нового маршрута!');
        }
    });
}

//
// Route delete functions
//

function DeleteRoute() {
    let routeId = document.getElementById('selected-route-id').value;
    const route_data = { route_id: routeId };
    APIDeleteRequest(route_data, routeAPI.main).then(function () {
        try {
            FillRouteList().then(() => {
                document.getElementById('route-data').classList.add('d-none');
                alert('Маршрут удален!');
            });
        } catch (err) {
            alert('Ошибка при удалении маршрута!');
        }
    });
}

//
// Route edit functions
//

// Select function for path feature id
function EditPathFeature(pathFeatureId) {
    const pathFeature = routeVectorSource.getFeatureById(pathFeatureId);
    if (!pathFeature) return;
    editMode = 'route-path-edit';
    mapSelectInteraction.getFeatures().clear();
    mapSelectInteraction.getFeatures().push(pathFeature);
    mapSelectInteraction.dispatchEvent({
        type: 'select',
        selected: [pathFeature],
        deselected: []
    });
    // PanToFeature(pathFeature);
}

function ClearEditRouteForm() {
    inputClearHelper(editRouteInterface.id);
    inputClearHelper(editRouteInterface.name);
    inputClearHelper(editRouteInterface.type);
    editRouteInterface.typeField.classList.add('d-none');
    editRouteInterface.typeChk.checked = false;
    editRouteInterface.typeSelect.disabled = false;
    selectClearHelper(editRouteInterface.typeSelect);
}

function SelectRouteData(routeId) {
    if (routeId === '') return;
    ClearEditRouteForm();
    DisplayRoute(routeId);
    editedRoute = GetSelectedRoute(routeId);
    document.getElementById('route-data').classList.remove('d-none');
    editRouteInterface.name.value = editedRoute.name;
    editRouteInterface.id.value = editedRoute.id;

    FillRouteTypeSelect(editRouteInterface.typeSelect).then(() => {
        if (editedRoute.route_type !== null) editRouteInterface.typeSelect.value = editedRoute.route_type.id;
    });

    // edit_route_path_a_stops = ConvertBusStopsToDict(editedRoute.path_a_stops);
    // edit_route_path_b_stops = ConvertBusStopsToDict(editedRoute.path_b_stops);

    // pathABusStopList = document.getElementById('route-path-a-stops-list');
    // pathBBusStopList = document.getElementById('route-path-b-stops-list');

    // FillBusStopsContainer(edit_route_path_a_stops, pathABusStopList, false);
    // FillBusStopsContainer(edit_route_path_b_stops, pathBBusStopList, false);

    document.getElementById('show-route-path-a').onclick = function () {
        EditPathFeature(editedRoute.path_a.line.id);
    };
    document.getElementById('show-route-path-b').onclick = function () {
        EditPathFeature(editedRoute.path_b.line.id);
    };

    ShowRouteBusstops(editedRoute);
}

function FillBusStopsContainer(stopsDict, container, newRoute) {
    container.innerHTML = '';
    let busstopBadge = null;
    let busstopBadgeText = null;
    if (Object.keys(stopsDict).length === 0) {
        busstopBadge = document.createElement('SPAN');
        busstopBadgeText = document.createTextNode('Отсутствуют');
        busstopBadge.appendChild(busstopBadgeText);
        busstopBadge.classList.add('badge', 'text-bg-secondary');
        container.appendChild(busstopBadge);
    } else {
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
                };
            } else {
                busstopBadge.onclick = function () {
                    DeleteRouteBusStop(key);
                };
            }
            container.appendChild(busstopBadge);
        }
    }
}

function DeleteRouteBusStop(busStopId) {
    delete edit_route_path_a_stops[busStopId];
    delete edit_route_path_b_stops[busStopId];
    FillBusStopsContainer(edit_route_path_a_stops, pathABusStopList, false);
    FillBusStopsContainer(edit_route_path_b_stops, pathBBusStopList, false);
}

function SelectRouteBusStopFeature(PathDirection) {
    if (PathDirection === 'path-a') {
        editMode = 'route-add-busstop-path-a';
    } else if (PathDirection === 'path-b') {
        editMode = 'route-add-busstop-path-b';
    }
}

function AddRouteBusstop(BusStopFeature, PathDirection) {
    if (PathDirection === 'path-a') {
        delete edit_route_path_b_stops[BusStopFeature.get('map_object_id')];
        edit_route_path_a_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('busstop_name');
    } else if (PathDirection === 'path-b') {
        delete edit_route_path_a_stops[BusStopFeature.get('map_object_id')];
        edit_route_path_b_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('busstop_name');
    }
    FillBusStopsContainer(edit_route_path_a_stops, pathABusStopList, false);
    FillBusStopsContainer(edit_route_path_b_stops, pathBBusStopList, false);
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
        if (loadedRoutes[i].id === routeId) return loadedRoutes[i];
    }
    return null;
}

function ShowRouteBusstops(route, direction = 'a') {
    document.getElementById('as_route-data').classList.remove('d-none');
    document.getElementById('as_route-transport-name').innerText = route.name;
    if (route.route_type !== null) document.getElementById('as_route-transport-type').innerText = route.route_type.name;
    if (!additionalSidebarVisible) {
        ToggleAdditionalSidebar();
    }
}

function RouteEditFormValidation() {
    let result = true;
    result *= inputValidationHelper(editRouteInterface.name);
    if (editRouteInterface.typeChk.checked) {
        result *= inputValidationHelper(editRouteInterface.type);
        selectClearHelper(editRouteInterface.typeSelect);
    } else {
        result *= selectValidationHelper(editRouteInterface.typeSelect);
        inputClearHelper(editRouteInterface.type);
    }
    return result;
}
