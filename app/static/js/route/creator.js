// New Route creator file

// ---------------------------
// Route map layers definition
// ---------------------------

const newRouteVectorSource = new olVectorSource({ wrapX: false });
let newRouteVectorLayer = new olVectorLayer({ source: newRouteVectorSource, style: mapStyleFunction });
map.addLayer(newRouteVectorLayer);

// ----------------------------
// Vars for keep route features
// ----------------------------

let feature_path_a = null;
let feature_path_b = null;
let path_a_stops = {};
let path_b_stops = {};

// interface elements dict

const routeInterface = {
    name: document.getElementById('name'),
    pathA: document.getElementById('path-a'),
    pathB: document.getElementById('path-b'),
    pathAFlag: document.getElementById('path-a-flag'),
    pathBFlag: document.getElementById('path-b-flag'),
    pathAStops: document.getElementById('stops-a'),
    pathBStops: document.getElementById('stops-b'),
    typeDiv: () => {
        return document.getElementById('route-type');
    },
    typeSelect: () => {
        return document.getElementById('route-type-select');
    },
    typeInput: () => {
        return document.getElementById('route-type-input');
    }
};

const clearNewRouteForm = () => {
    cancelDraw();
    selectedFeature = null;
    inputClearHelper(routeInterface.name);
    featureDrawClearHelper(
        feature_path_a,
        newRouteVectorSource,
        routeInterface.pathA,
        routeInterface.pathAFlag,
        routeInvalidation
    );
    featureDrawClearHelper(
        feature_path_b,
        newRouteVectorSource,
        routeInterface.pathB,
        routeInterface.pathBFlag,
        routeInvalidation
    );
    feature_path_a = null;
    feature_path_b = null;
    clearDict(path_a_stops);
    clearDict(path_b_stops);
};

const fillNewRouteForm = async () => {
    clearNewRouteForm();
    await fillRouteTypeSelect();
};

const fillRouteTypeSelect = async () => {
    await APIGetRequest(routeAPI.type).then((data) => {
        const routeTypeSelect = bs_select_new(
            'route-type',
            'Тип транспорта маршрута',
            '',
            'text',
            data,
            true,
            'Укажите тип транспорта маршрута',
            'Данный тип транспорта уже указан'
        );
        const routeTypeDiv = routeInterface.typeDiv();
        routeTypeDiv.innerHTML = '';
        routeTypeDiv.replaceWith(routeTypeSelect);
    });
};

// ---------------------------
// Route map draw functions
// ---------------------------

const drawRoute = (routeName) => {
    startDraw(newRouteVectorSource, drawTypes.line);
    mapDrawInteraction.on('drawend', function (e) {
        const feature = e.feature;
        feature.set('name', routeName);
        feature.set('type', 'new-path');
        routeValidation(routeName, feature);
        cancelDraw();
    });
    map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
};

// ------------------------------
// Route map validation functions
// ------------------------------

const routeValidation = (routeName, feature) => {
    flag = document.getElementById(routeName + '-flag');
    if (flag === null) return;
    flag.classList.remove('text-bg-danger');
    flag.classList.add('text-bg-success');
    flag.innerText = 'Указано';
    setRouteFeature(routeName, feature);
};

const routeInvalidation = (flag) => {
    if (flag === null) return;
    flag.classList.remove('text-bg-success');
    flag.classList.add('text-bg-danger');
    flag.innerText = 'Не указано';
};

const setRouteFeature = (routeName, feature) => {
    if (routeName === 'path-a') {
        if (feature_path_a !== null) newRouteVectorSource.removeFeature(feature_path_a);
        feature_path_a = feature;
        routeInterface.pathA.value = 'set';
        validationHelper(routeInterface.pathA);
    } else if (routeName === 'path-b') {
        if (feature_path_b !== null) newRouteVectorSource.removeFeature(feature_path_b);
        feature_path_b = feature;
        routeInterface.pathB.value = 'set';
        validationHelper(routeInterface.pathB);
    }
};

const routeFormValidation = () => {
    let result = true;
    result *= validationHelper(routeInterface.name);
    result *= validationHelper(routeInterface.pathA);
    result *= validationHelper(routeInterface.pathB);
    // if (routeInterface.typeChk.checked) {
    //     result *= inputValidationHelper(routeInterface.typeInput);
    //     selectClearHelper(routeInterface.typeSelect);
    // } else {
    //     result *= selectValidationHelper(routeInterface.typeSelect);
    //     inputClearHelper(routeInterface.typeInput);
    // }
    return result;
};

routeInterface.name.onchange = function () {
    validationHelper(routeInterface.name);
};

// ----------------------------------
// Route map delete feature functions
// ----------------------------------

const removeSelectedNewRouteFeature = () => {
    if (selectedFeature === null) return;
    let name = selectedFeature.get('name');
    if (name === 'path-a') {
        newRouteVectorSource.removeFeature(feature_path_a);
        routeInvalidation('path-a');
        inputClearHelper(routeInterface.pathA);
        feature_path_a = null;
        selectedFeature = null;
    } else if (name === 'path-b') {
        newRouteVectorSource.removeFeature(feature_path_b);
        routeInvalidation('path-b');
        inputValidationHelper(routeInterface.pathB);
        feature_path_b = null;
        selectedFeature = null;
    }
};

const deleteNewRouteFeature = (e) => {
    if (e.keyCode !== 46) return;
    removeSelectedNewRouteFeature();
};
document.addEventListener('keydown', deleteNewRouteFeature, false);

const removeLastPoint = (e) => {
    if (e.keyCode !== 8) return;
    if (mapDrawInteraction === null) return;
    mapDrawInteraction.removeLastPoint();
};
document.addEventListener('keydown', removeLastPoint, false);

const continueDrawRouteFeature = (e) => {
    if (e.keyCode !== 16) return;
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
    startDraw(vectorSource, drawTypes.line);
    mapDrawInteraction.extend(feature);
    mapDrawInteraction.on('drawend', function (e) {
        feature = e.feature;
        feature.set('name', routeName);
        feature.set('type', type);
        if (type === 'new-path') routeValidation(routeName, feature);
        cancelDraw();
        mapSelectInteraction.getFeatures().clear();
        mapSelectInteraction.getFeatures().push(feature);
        mapSelectInteraction.dispatchEvent({
            type: 'select',
            selected: [feature],
            deselected: []
        });
    });
    map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
};
document.addEventListener('keydown', continueDrawRouteFeature, false);

// ----------------------------------
// Route map select feature functions
// ----------------------------------

const selectNewRouteFeature = (routeName) => {
    flag = document.getElementById(routeName + '-flag');
    if (flag === null) return;
    flag.classList.remove('text-bg-success');
    flag.classList.add('text-bg-primary');
    flag.innerText = 'Выбрано';
};

const unselectNewRouteFeature = (routeName) => {
    flag = document.getElementById(routeName + '-flag');
    if (flag === null) return;
    flag.classList.remove('text-bg-primary');
    flag.classList.add('text-bg-success');
    flag.innerText = 'Указано';
};

const selectNewRouteBusStopFeature = (direction) => {
    cancelDraw();
    if (direction === 'path-a') {
        editMode = 'new-route-add-busstop-path-a';
    } else if (direction === 'path-b') {
        editMode = 'new-route-add-busstop-path-b';
    }
};

const showNewRouteBusStops = (direction) => {
    if (direction === 'path-a') {
        fillASRouteData(direction, selectNewRouteBusStopFeature, 'Остановки в направлении А', path_a_stops);
    } else if (direction === 'path-b') {
        fillASRouteData(direction, selectNewRouteBusStopFeature, 'Остановки в направлении B', path_b_stops);
    }
    if (!additionalSidebarVisible) toggleAdditionalSidebar();
};

const addNewRouteBusstop = (busstopFeature, direction) => {
    const name = busstopFeature.get('busstop_name');
    const map_id = busstopFeature.get('map_object_id');
    if (direction === 'path-a') {
        if (path_b_stops) delete path_b_stops[busstopFeature.get('map_object_id')];
        path_a_stops[map_id] = name;
    } else if (direction === 'path-b') {
        if (path_a_stops) delete path_a_stops[busstopFeature.get('map_object_id')];
        path_b_stops[map_id] = name;
    }
    ASRouteAddBusstop(name);
};

// ----------------------------------
// Route map save functions
// ----------------------------------

function SaveNewRoute() {
    if (!routeFormValidation()) {
        alert('Проверьте данные нового маршрута!');
        return;
    }
    let features = [feature_path_a, feature_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    let route_type;
    let new_route_type = false;
    if (routeInterface.typeChk.checked) {
        route_type = routeInterface.typeInput.value;
        new_route_type = true;
    } else {
        route_type = routeInterface.typeSelect.value;
    }
    const route_data = {
        name: routeInterface['nameInput'].value,
        geojson_data: geoJSONdata,
        path_a_stops: new_route_path_a_stops,
        path_b_stops: new_route_path_b_stops,
        route_type: route_type,
        new_route_type: new_route_type
    };
    APIPostRequest(route_data, routeAPI['main']).then(function () {
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
    FillBusStopsContainer(new_route_path_a_stops, routeInterface['newPathABusList'], true);
    FillBusStopsContainer(new_route_path_b_stops, routeInterface['newPathBBusList'], true);
}
