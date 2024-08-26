// Draw interactions for new route

// interface elements dict

const routeInterface = {
    "nameInput": document.getElementById("route-name"),
    "pathAInput": document.getElementById('route-path-a'),
    "pathBInput": document.getElementById('route-path-b'),
    "newPathABusContainer": document.getElementById('new-route-path-a-stops-container'),
    "newPathBBusContainer": document.getElementById('new-route-path-b-stops-container'),
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
    // removing interactions before draw
    map.removeInteraction(mapSelectInteraction);
    map.removeInteraction(mapModifyInteraction);
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);
    mapDrawInteraction = new olDrawInteraction({
        source: newRouteVectorSource, type: 'LineString', pixelTolerance: 50
    });
    mapSnapInteraction = new olSnapInteraction({ source: newRouteVectorSource });
    mapDrawInteraction.on('drawend', function (evt) {
        const feature = evt.feature;
        feature.set('name', routeName);
        feature.set('type', 'new-path');
        routeValidation(routeName, feature);
        map.removeInteraction(mapDrawInteraction);
        map.removeInteraction(mapSnapInteraction);
        map.addInteraction(mapSelectInteraction);
    });
    map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
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

function ClearNewRoute() {
    routeInterface["nameInput"].value = '';
    routeInterface["nameInput"].classList.remove('is-valid');
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
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusContainer"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusContainer"], true);
}

function RouteFormValidation() {
    let result = true;
    result *= validationHelper(routeInterface["nameInput"]);
    result *= validationHelper(routeInterface["pathAInput"]);
    result *= validationHelper(routeInterface["pathBInput"]);
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
    if (evt.keyCode === 46) RemoveSelectedNewRouteFeature();
};
document.addEventListener('keydown', deleteNewRouteFeature, false);

const removeLastPoint = function (evt) {
    if (mapDrawInteraction === null) return;
    if (evt.keyCode === 8) mapDrawInteraction.removeLastPoint();
}
document.addEventListener('keydown', removeLastPoint, false);


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
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusContainer"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusContainer"], true);
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
    const route_data = {
        'name': routeInterface["nameInput"].value,
        'geojson_data': geoJSONdata,
        'path_a_stops': new_route_path_a_stops,
        'path_b_stops': new_route_path_b_stops
    };
    APIPostRequest(route_data, routeAPI["main"]).then(function () {
        alert('Маршрут сохранен!');
        try {
            ClearNewRoute();
            LoadRoutes();
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
    FillBusStopsContainer(new_route_path_a_stops, routeInterface["newPathABusContainer"], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface["newPathBBusContainer"], true);
}