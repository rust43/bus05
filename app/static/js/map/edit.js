// ----------------------
// Map edit functions
// ----------------------

// Modify interaction
const mapModifyInteraction = new olModifyInteraction({
    features: mapSelectInteraction.getFeatures(),
    style: mapOverlayStyleFunction,
});

let mapDrawInteraction = null;
let mapSnapInteraction = null;

// Variable for save selected feature
let selectedFeature = null;

let editMode = null;

// Select function
const mapSelectFunction = function () {
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
    }
    else if (selectedFeature.get('type') === 'new-busstop') {
        SelectNewBusStopFeature(selectedFeature.get('name'));
        map.addInteraction(mapModifyInteraction);
    }
    else if (selectedFeature.get('type') === 'busstop') {
        // ShowBusStopPopup(selectedFeature);
        if (editMode === 'new-route-add-busstop-path-a') {
            AddNewRouteBusstop(feature, 'path-a');
        }
        else if (editMode === 'new-route-add-busstop-path-b') {
            AddNewRouteBusstop(feature, 'path-b');
        }
        else if (editMode === 'route-add-busstop-path-a') {
            AddRouteBusstop(feature, 'path-a');
        }
        else if (editMode === 'route-add-busstop-path-b') {
            AddRouteBusstop(feature, 'path-b');
        }
    }
    if (editMode === 'route-path-edit') {
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

let cancelEditMode = function (evt) {
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