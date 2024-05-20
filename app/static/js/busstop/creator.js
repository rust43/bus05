// Draw interactions for new BusStop

const newBusStopNameInput = document.getElementById('busstop-new-name');
const newBusStopLocationInput = document.getElementById('busstop-new-location');

// ---------------------------
// BusStop map layers definition
// ---------------------------

let newBusStopVectorSource = new olVectorSource({ wrapX: false });
let newBusStopVectorLayer = new olVectorLayer({ source: newBusStopVectorSource, style: setFeatureStyle });
map.addLayer(newBusStopVectorLayer);

// ------------------------------
// Vars for keep BusStop location
// ------------------------------

let newBusStopLocationFeature = null;

// ---------------------------
// BusStop map draw functions
// ---------------------------

function DrawBusStop(BusStopName) {

    // removing interactions
    map.removeInteraction(mapSelectInteraction);
    map.removeInteraction(mapModifyInteraction);
    map.removeInteraction(mapTranslateInteraction);
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);

    mapDrawInteraction = new olDrawInteraction({
        source: newBusStopVectorSource, type: 'Point', pixelTolerance: 50
    });

    mapSnapInteraction = new olSnapInteraction({ source: newBusStopVectorSource });

    mapDrawInteraction.on('drawend', function (evt) {
        const feature = evt.feature;
        feature.set('name', BusStopName);
        feature.set('type', 'new-busstop');
        BusStopValidation(BusStopName, feature);
        map.removeInteraction(mapDrawInteraction);
        map.removeInteraction(mapSnapInteraction);
        map.addInteraction(mapSelectInteraction);
        map.addInteraction(mapModifyInteraction);
        map.addInteraction(mapTranslateInteraction);
    });
    map.addInteraction(mapDrawInteraction);
    map.addInteraction(mapSnapInteraction);
};

// --------------------------------
// BusStop map validation functions
// --------------------------------

const BusStopValidation = function (BusStopName, feature) {
    const flag = document.getElementById(BusStopName + "-flag");
    flag.classList.remove("text-bg-danger");
    flag.classList.add("text-bg-success");
    flag.innerText = "Указано";
    setBusStopFeature(BusStopName, feature);
};

const BusStopInvalidation = function (BusStopName) {
    const flag = document.getElementById(BusStopName + "-flag");
    flag.classList.remove("text-bg-success");
    flag.classList.add("text-bg-danger");
    flag.innerText = "Не указано";
};

const setBusStopFeature = function (BusStopName, feature) {
    if (BusStopName === 'busstop-new-location') {
        if (newBusStopLocationFeature !== null) newBusStopVectorSource.removeFeature(newBusStopLocationFeature);
        newBusStopLocationFeature = feature;
        newBusStopLocationInput.value = 'set';
        validationHelper(newBusStopLocationInput);
    }
};

function DeleteNewBusStop() {
    newBusStopLocationInput.value = '';
    newBusStopLocationInput.classList.remove('is-valid');
    if (newBusStopLocationFeature !== null) {
        newBusStopVectorSource.removeFeature(newBusStopLocationFeature);
        BusStopInvalidation('busstop-new-location');
        newBusStopLocationInput.value = '';
        newBusStopVectorSource = null;
    }
    selectedFeature = null;
};

function BusStopFormValidation() {
    let result = true;
    result *= validationHelper(newBusStopNameInput);
    result *= validationHelper(newBusStopLocationInput);
    return result;
};

newBusStopNameInput.onchange = function () {
    validationHelper(newBusStopNameInput);
};

// ------------------------------------
// BusStop map delete feature functions
// ------------------------------------

function RemoveSelectedNewBusStopFeature() {
    let name = selectedFeature.get('name');
    if (name == 'busstop-new-location') {
        newBusStopVectorSource.removeFeature(newBusStopLocationFeature);
        BusStopInvalidation('busstop-new-location');
        newBusStopLocationInput.value = '';
        newBusStopLocationFeature = null;
    }
    selectedFeature = null;
};

const deleteNewBusStopFeature = function (evt) {
    if (evt.keyCode === 46) RemoveSelectedNewBusStopFeature();
};
document.addEventListener('keydown', deleteNewBusStopFeature, false);

// ------------------------------------
// BusStop map select feature functions
// ------------------------------------

function SelectNewBusStopFeature(BusStopName) {
    const flag = document.getElementById(BusStopName + "-flag");
    flag.classList.remove("text-bg-success");
    flag.classList.add("text-bg-primary");
    flag.innerText = "Выбрано";
};

function UnselectNewBusStopFeature(BusStopName) {
    const flag = document.getElementById(BusStopName + "-flag");
    flag.classList.remove("text-bg-primary");
    flag.classList.add("text-bg-success");
    flag.innerText = "Указано";
};

// ----------------------------------
// BusStop map save functions
// ----------------------------------

function BusStopFormSave() {

    if (!BusStopFormValidation()) {
        alert("Проверьте данные новой остановки!");
        return;
    }

    let features = [newBusStopLocationFeature];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );

    const busstop_data = {
        "name": newBusStopLocationInput.value,
        "geojson_data": geoJSONdata,
    };

    PostBusStop(busstop_data).then(response => {
        alert("Остановка сохранена!");
        try {
            LoadBusStops();
        }
        catch (err) {
            alert("Ошибка при загрузке новых остановок!");
        }
    });
};

async function PostBusStop(busstop_data) {
    const url = host + "/api/v1/busstop/";
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
            body: JSON.stringify(busstop_data),
        });
    if (response.ok) {
        return true;
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}
