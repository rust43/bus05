// ----------------------
// Map edit functions
// ----------------------

// Modify interaction
const mapModifyInteraction = new olModifyInteraction({
    features: mapSelectInteraction.getFeatures(),
    style: mapOverlayStyleFunction
});

let mapDrawInteraction = null;
let mapSnapInteraction = null;

// Variable for save selected feature
let selectedFeature = null;

let editMode = null;

// Select function
const mapSelectFunction = function() {
    map.removeInteraction(mapModifyInteraction);
    mapOverlay.setPosition(undefined);
    const feature = mapSelectInteraction.getFeatures().item(0);
    if (selectedFeature !== null) {
        if (selectedFeature.get('type') === 'new-path')
            UnselectNewRouteFeature(selectedFeature.get('name'));
        else if (selectedFeature.get('type') === 'new-busstop')
            UnselectNewBusStopFeature(selectedFeature.get('name'));
        selectedFeature = null;
    }
    if (!feature) return;
    selectedFeature = feature;
    if (selectedFeature.get('type') === 'new-path') {
        SelectNewRouteFeature(selectedFeature.get('name'));
        map.addInteraction(mapModifyInteraction);
    } else if (selectedFeature.get('type') === 'new-busstop') {
        SelectNewBusStopFeature(selectedFeature.get('name'));
        map.addInteraction(mapModifyInteraction);
    } else if (selectedFeature.get('type') === 'busstop') {
        // ShowBusStopPopup(selectedFeature);
        if (editMode === 'new-route-add-busstop-path-a') {
            AddNewRouteBusstop(feature, 'path-a');
        } else if (editMode === 'new-route-add-busstop-path-b') {
            AddNewRouteBusstop(feature, 'path-b');
        } else if (editMode === 'route-add-busstop-path-a') {
            AddRouteBusstop(feature, 'path-a');
        } else if (editMode === 'route-add-busstop-path-b') {
            AddRouteBusstop(feature, 'path-b');
        }
    }
    if (editMode === 'route-path-edit' || editMode === 'busstop-location-edit') {
        map.addInteraction(mapModifyInteraction);
    }
    editMode = null;
};

function ShowBusStopPopup(BusStopFeature) {
    const name = BusStopFeature.get('name');
    const coordinate = olGetExtentCenter(BusStopFeature.getGeometry().getExtent());
    popupContent.innerHTML = '<p>Название остановки: ' + name + '</p>';
    mapOverlay.setPosition(coordinate);
}

// Binding select function
mapSelectInteraction.on('select', mapSelectFunction);

// ------------------
// Keydown functions
// ------------------

let cancelEditMode = function(evt) {
    if (evt.keyCode === 27) {
        map.removeInteraction(mapDrawInteraction);
        map.removeInteraction(mapSnapInteraction);
        map.removeInteraction(mapModifyInteraction);
        // map.removeInteraction(mapTranslateInteraction);
        map.addInteraction(mapSelectInteraction);
    }
};
document.addEventListener('keydown', cancelEditMode, false);

// --------------------------
// Color conversion functions
// --------------------------

function hexToRGB(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (alpha) return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'; else return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function rgbToHex(rgb) {
    let r = rgb.split(',')[0], g = rgb.split(',')[1], b = rgb.split(',')[2];
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

//
// Map export functions
//

async function ExportData() {
    let data = await GetExportData();
    data = JSON.stringify(data);
    DownloadJSON(data, 'data.txt', 'text/plain');
}

async function GetExportData() {
    const url = host + '/api/v1/data/';
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

//
// Map export helper functions
//

function DownloadJSON(content, fileName, contentType) {
    const link = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
}
