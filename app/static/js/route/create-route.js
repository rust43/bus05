// Draw interactions for new route

const routeNameInput = document.getElementById('route-name');
const pathAInput = document.getElementById('route-path-a');
const pathBInput = document.getElementById('route-path-b');

// ---------------------------
// Route map layers definition
// ---------------------------

let newRouteVectorSource = new olVectorSource({ wrapX: false });
let newRouteVectorLayer = new olVectorLayer({ source: newRouteVectorSource, style: DefaultRouteStyleFunction });
map.addLayer(newRouteVectorLayer);

// ----------------------------
// Vars for keep route features
// ----------------------------

let feature_path_a = null;
let feature_path_b = null;

// ---------------------------
// Route map draw functions
// ---------------------------

function DrawRoute(routeName) {
    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(translate);
    if (draw) map.removeInteraction(draw);
    draw = new olDrawInteraction({
        source: newRouteVectorSource, type: 'LineString', pixelTolerance: 50
    });
    snap = new olSnapInteraction({ source: newRouteVectorSource });
    draw.on('drawend', function (evt) {
        const feature = evt.feature;
        feature.set('arrow', 'true');
        feature.set('name', routeName);
        feature.set('type', 'new-route');
        routeValidation(routeName, feature);
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.addInteraction(select);
        map.addInteraction(modify);
        map.addInteraction(translate);
    });
    map.addInteraction(draw);
    map.addInteraction(snap);
};

// ---------------------------
// Route map style functions
// ---------------------------

function DefaultRouteStyleFunction(feature) {
    if (!feature) return;
    const strokeColor = '#308C00';
    const strokeWidth = 3;
    const stroke = new olStrokeStyle({ color: strokeColor, width: strokeWidth });
    const styles = [new olStyle({ stroke: stroke })];
    feature.setStyle(styles);
    feature.changed();
};

// ------------------------------
// Route map validation functions
// ------------------------------

const routeValidation = function (routeName, feature) {
    const flag = document.getElementById(routeName + "-flag");
    flag.classList.remove("text-bg-danger");
    flag.classList.add("text-bg-success");
    flag.innerText = "Указано";
    setRouteFeature(routeName, feature);
};

const routeInvalidation = function (routeName) {
    const flag = document.getElementById(routeName + "-flag");
    flag.classList.remove("text-bg-success");
    flag.classList.add("text-bg-danger");
    flag.innerText = "Не указано";
};

const setRouteFeature = function (routeName, feature) {
    if (routeName === 'route-path-a') {
        if (feature_path_a !== null) newRouteVectorSource.removeFeature(feature_path_a);
        feature_path_a = feature;
        pathAInput.value = 'set';
        validationHelper(pathAInput);
    }
    else if (routeName === 'route-path-b') {
        if (feature_path_b !== null) newRouteVectorSource.removeFeature(feature_path_b);
        feature_path_b = feature;
        pathBInput.value = 'set';
        validationHelper(pathBInput);
    }
};

function ClearNewRoutes() {
    routeNameInput.value = '';
    routeNameInput.classList.remove('is-valid');
    if (feature_path_a !== null) {
        newRouteVectorSource.removeFeature(feature_path_a);
        routeInvalidation('route-path-a');
        pathAInput.value = '';
        feature_path_a = null;
    }
    if (feature_path_b !== null) {
        newRouteVectorSource.removeFeature(feature_path_b);
        routeInvalidation('route-path-b');
        pathBInput.value = '';
        feature_path_b = null;
    }
    selectedFeature = null;
};

function RouteFormValidation() {
    let result = true;
    result *= validationHelper(routeNameInput);
    result *= validationHelper(pathAInput);
    result *= validationHelper(pathBInput);
    return result;
};

const validationHelper = function (input) {
    if (input && input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    }
    else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        return false;
    }
};

routeNameInput.onchange = function () {
    validationHelper(routeNameInput);
};

// ----------------------------------
// Route map delete feature functions
// ----------------------------------

function RemoveSelectedRouteFeature() {
    let name = selectedFeature.get('name');
    if (name == 'route-path-a') {
        newRouteVectorSource.removeFeature(feature_path_a);
        routeInvalidation('route-path-a');
        pathAInput.value = '';
        feature_path_a = null;
    }
    else if (name == 'route-path-b') {
        newRouteVectorSource.removeFeature(feature_path_b);
        routeInvalidation('route-path-b');
        pathAInput.value = '';
        feature_path_b = null;
    }
    selectedFeature = null;
};

const deleteRouteFeature = function (evt) {
    if (evt.keyCode === 46) RemoveSelectedRouteFeature();
};
document.addEventListener('keydown', deleteRouteFeature, false);

// ----------------------------------
// Route map select feature functions
// ----------------------------------

function SelectNewRouteFeature(routeName) {
    const flag = document.getElementById(routeName + "-flag");
    flag.classList.remove("text-bg-success");
    flag.classList.add("text-bg-primary");
    flag.innerText = "Выбрано";
};

function UnselectNewRouteFeature(routeName) {
    const flag = document.getElementById(routeName + "-flag");
    flag.classList.remove("text-bg-primary");
    flag.classList.add("text-bg-success");
    flag.innerText = "Указано";
};

// ----------------------------------
// Route map save functions
// ----------------------------------

function RouteFormSave() {

    if (!RouteFormValidation()) {
        alert("Проверьте данные нового маршрута!");
        return;
    }

    let features = [feature_path_a, feature_path_b];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );

    console.log(geoJSONdata);

    const route_data = {
        "name": routeNameInput.value,
        "geojson_data": geoJSONdata,
        "assigned_stops": []
    };

    PostRoute(route_data).then(response => {
        alert("Маршрут сохранен!");
        try {
            LoadRoutes();
        }
        catch (err) {
            alert("Ошибка при загрузке новых маршрутов!");
        }
    });
};

async function PostRoute(route_data) {
    const url = host + "/api/v1/routes/";
    const response = await fetch(
        url,
        {
            method: "post",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(route_data),
        });
    if (response.ok) {
        return true;
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}

const createRouteSelectFunction = function () {
    const feature = select.getFeatures().getArray()[0];
    if (selectedFeature !== null) {
        if (feature_type === 'new-route')
            UnselectNewRouteFeature(selectedFeature.get('name'));
        selectedFeature.setStyle(undefined);
        selectedFeature = null;
    }
    if (!feature) return;
    const feature_name = feature.get('name');
    const feature_type = feature.get('type');
    selectedFeature = feature;
    SetFeatureSelectedStyle(feature);
    if (feature_type === 'new-route')
        SelectNewRouteFeature(feature_name);
};