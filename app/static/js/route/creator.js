// Draw interactions for new route

// interface elements dict

const routeInterface = {
    "nameInput": document.getElementById("route-name"),
    "pathAInput": document.getElementById('route-path-a'),
    "pathBInput": document.getElementById('route-path-b'),
    "newPathABusList": document.getElementById('new-route-path-a-stops-list'),
    "newPathBBusList": document.getElementById('new-route-path-b-stops-list'),
    "typeInput": document.getElementById('new-route-type'),
    "typeSelect": document.getElementById('new-route-type-select'),
    "typeInputField": document.getElementById("new-route-type-input"),
    "typeChk": document.getElementById("new-route-type-chk"),
}

// ---------------------------
// Route map layers definition
// ---------------------------

const newRouteVectorSource = new olVectorSource({ wrapX: false });
let newRouteVectorLayer = new olVectorLayer({ source: newRouteVectorSource, style: mapStyleFunction, className: 'newRouteVectorLayer' });
map.addLayer(newRouteVectorLayer);

// ----------------------------
// Vars for keep route features
// ----------------------------

let feature_path_a = null;
let feature_path_b = null;
let new_route_path_a_stops = {};
let new_route_path_b_stops = {};

// ---------------------------
// Route map draw functions
// ---------------------------

function DrawRoute(routeName) {
    StartDraw(newRouteVectorSource);
    mapDrawInteraction.on('drawend', function (evt) {
        const feature = evt.feature;
        feature.set('name', routeName);
        feature.set('type', 'new-path');
        routeValidation(routeName, feature);
        CancelDraw();
    });
    map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
}

function CancelDraw() {
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);
    map.addInteraction(mapSelectInteraction);
}

function StartDraw(vectorSource) {
    // removing interactions before draw
    map.removeInteraction(mapSelectInteraction);
    map.removeInteraction(mapModifyInteraction);
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);
    mapDrawInteraction = new olDrawInteraction({
        source: vectorSource, type: 'LineString', pixelTolerance: 50
    });
    mapSnapInteraction = new olSnapInteraction({ source: vectorSource });
}

// ------------------------------
// Route map validation functions
// ------------------------------

const routeValidation = function (routeName, feature) {
    const flag = document.getElementById(routeName + '-flag');
    flag.classList.remove('text-bg-danger');
    flag.classList.add('text-bg-success');
    flag.innerText = 'Указано';
    setRouteFeature(routeName, feature);
};

const routeInvalidation = function (routeName) {
    const flag = document.getElementById(routeName + '-flag');
    flag.classList.remove('text-bg-success');
    flag.classList.add('text-bg-danger');
    flag.innerText = 'Не указано';
};

const setRouteFeature = function (routeName, feature) {
    if (routeName === 'route-path-a') {
        if (feature_path_a !== null) newRouteVectorSource.removeFeature(feature_path_a);
        feature_path_a = feature;
        routeInterface["pathAInput"].value = 'set';
        validationHelper(routeInterface["pathAInput"]);
    } else if (routeName === 'route-path-b') {
        if (feature_path_b !== null) newRouteVectorSource.removeFeature(feature_path_b);
        feature_path_b = feature;
        routeInterface["pathBInput"].value = 'set';
        validationHelper(routeInterface["pathBInput"]);
    }
};

async function FillNewRouteForm() {
    await FillRouteTypeSelect(routeInterface.typeSelect);
}

async function FillRouteTypeSelect(selectElement) {
    await APIGetRequest(routeAPI.type).then((TypesList) => {
        FillSelect(selectElement, TypesList, ["id", "name"]);
    });
}

function ClearNewRoute() {
    CancelDraw();
    routeInterface["nameInput"].value = '';
    routeInterface["nameInput"].classList.remove('is-valid');
    inputClearHelper(routeInterface.typeInput);
    routeInterface.typeChk.checked = false;
    routeInterface.typeInputField.classList.add('d-none');
    selectClearHelper(routeInterface.typeSelect);
    if (feature_path_a !== null) {
        newRouteVectorSource.removeFeature(feature_path_a);
        routeInvalidation('route-path-a');
        routeInterface["pathAInput"].value = '';
        feature_path_a = null;
    }
    if (feature_path_b !== null) {
        newRouteVectorSource.removeFeature(feature_path_b);
        routeInvalidation('route-path-b');
        routeInterface["pathBInput"].value = '';
        feature_path_b = null;
    }
    selectedFeature = null;
    for (var prop in new_route_path_a_stops) {
        if (new_route_path_a_stops.hasOwnProperty(prop)) {
            delete new_route_path_a_stops[prop];
        }
    }
    for (var prop in new_route_path_b_stops) {
        if (new_route_path_b_stops.hasOwnProperty(prop)) {
            delete new_route_path_b_stops[prop];
        }
    }
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusList"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusList"], true);
}

function RouteFormValidation() {
    let result = true;
    result *= validationHelper(routeInterface["nameInput"]);
    result *= validationHelper(routeInterface["pathAInput"]);
    result *= validationHelper(routeInterface["pathBInput"]);
    if (routeInterface.typeChk.checked) {
        result *= inputValidationHelper(routeInterface.typeInput);
        selectClearHelper(routeInterface.typeSelect);
    } else {
        result *= selectValidationHelper(routeInterface.typeSelect);
        inputClearHelper(routeInterface.typeInput);
    }
    return result;
}

const validationHelper = function (input) {
    if (input && input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        return false;
    }
};

routeInterface["nameInput"].onchange = function () {
    validationHelper(routeInterface["nameInput"]);
};

// ----------------------------------
// Route map delete feature functions
// ----------------------------------

function RemoveSelectedNewRouteFeature() {
    if (selectedFeature === null) return;
    let name = selectedFeature.get('name');
    if (name === 'route-path-a') {
        newRouteVectorSource.removeFeature(feature_path_a);
        routeInvalidation('route-path-a');
        routeInterface["pathAInput"].value = '';
        feature_path_a = null;
        selectedFeature = null;
    } else if (name === 'route-path-b') {
        newRouteVectorSource.removeFeature(feature_path_b);
        routeInvalidation('route-path-b');
        routeInterface["pathBInput"].value = '';
        feature_path_b = null;
        selectedFeature = null;
    }
}

const deleteNewRouteFeature = function (evt) {
    if (evt.keyCode !== 46) return;
    RemoveSelectedNewRouteFeature();
};
document.addEventListener('keydown', deleteNewRouteFeature, false);

const removeLastPoint = function (evt) {
    if (evt.keyCode !== 8) return;
    if (mapDrawInteraction === null) return;
    mapDrawInteraction.removeLastPoint();
}
document.addEventListener('keydown', removeLastPoint, false);

const continueDrawRouteFeature = function (evt) {
    if (evt.keyCode !== 16) return;
    if (mapSelectInteraction === null) return;
    let feature = mapSelectInteraction.getFeatures().item(0);
    if (!feature) return;
    const routeName = feature.get('name');
    const type = feature.get('type');
    if (type !== 'new-path' && type !== 'path') return;
    // remove existing feature from map
    let vectorSource;
    if (type === 'new-path') vectorSource = newRouteVectorSource;
    else vectorSource = routeVectorSource;
    vectorSource.removeFeature(feature);
    StartDraw(vectorSource);
    mapDrawInteraction.extend(feature);
    mapDrawInteraction.on('drawend', function (evt) {
        feature = evt.feature;
        feature.set('name', routeName);
        feature.set('type', type);
        if (type === 'new-path') routeValidation(routeName, feature);
        CancelDraw();
        mapSelectInteraction.getFeatures().clear();
        mapSelectInteraction.getFeatures().push(feature);
        mapSelectInteraction.dispatchEvent({
            type: 'select',
            selected: [feature],
            deselected: []
        });
    });
    map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
}
document.addEventListener('keydown', continueDrawRouteFeature, false);

// ----------------------------------
// Route map select feature functions
// ----------------------------------

function SelectNewRouteFeature(routeName) {
    const flag = document.getElementById(routeName + '-flag');
    flag.classList.remove('text-bg-success');
    flag.classList.add('text-bg-primary');
    flag.innerText = 'Выбрано';
}

function UnselectNewRouteFeature(routeName) {
    const flag = document.getElementById(routeName + '-flag');
    flag.classList.remove('text-bg-primary');
    flag.classList.add('text-bg-success');
    flag.innerText = 'Указано';
}

function SelectNewRouteBusStopFeature(PathDirection) {
    CancelDraw();
    if (PathDirection === 'path-a') {
        editMode = 'new-route-add-busstop-path-a';
    } else if (PathDirection === 'path-b') {
        editMode = 'new-route-add-busstop-path-b';
    }
}

function AddNewRouteBusstop(BusStopFeature, PathDirection) {
    if (PathDirection === 'path-a') {
        if (new_route_path_b_stops) delete new_route_path_b_stops[BusStopFeature.get('map_object_id')];
        new_route_path_a_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('busstop_name');
    } else if (PathDirection === 'path-b') {
        if (new_route_path_a_stops) delete new_route_path_a_stops[BusStopFeature.get('map_object_id')];
        new_route_path_b_stops[BusStopFeature.get('map_object_id')] = BusStopFeature.get('busstop_name');
    }
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusList"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusList"], true);
}

// ----------------------------------
// Route map save functions
// ----------------------------------

function SaveNewRoute() {
    if (!RouteFormValidation()) {
        alert('Проверьте данные нового маршрута!');
        return;
    }
    let features = [feature_path_a, feature_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );
    let route_type;
    let new_route_type = false;
    if (routeInterface.typeChk.checked) {
        route_type = routeInterface.typeInput.value;
        new_route_type = true;
    } else {
        route_type = routeInterface.typeSelect.value;
    }
    const route_data = {
        'name': routeInterface["nameInput"].value,
        'geojson_data': geoJSONdata,
        'path_a_stops': new_route_path_a_stops,
        'path_b_stops': new_route_path_b_stops,
        'route_type': route_type,
        'new_route_type': new_route_type,
    };
    APIPostRequest(route_data, routeAPI["main"]).then(function () {
        try {
            ClearNewRoute();
            LoadRoutes();
            FillNewRouteForm();
            alert('Маршрут сохранен!');
        } catch (err) {
            alert('Ошибка при загрузке новых маршрутов!');
        }
    });
}

function DeleteNewRouteBusStop(busStopId) {
    if (new_route_path_a_stops) {
        delete new_route_path_a_stops[busStopId];
    }
    if (new_route_path_b_stops) {
        delete new_route_path_b_stops[busStopId];
    }
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusList"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusList"], true);
}

function RouteTypeChkListener(chkEl, inputParent, inputEl, selectEl) {
    chkEl.addEventListener("change", (event) => {
        if (event.currentTarget.checked) {
            inputParent.classList.remove("d-none");
            inputEl.disabled = false;
            selectEl.disabled = true;
        } else {
            inputParent.classList.add("d-none");
            inputEl.disabled = true;
            selectEl.disabled = false;
        }
    });
}

RouteTypeChkListener(
    routeInterface.typeChk,
    routeInterface.typeInputField,
    routeInterface.typeInput,
    routeInterface.typeSelect,
);