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
    const type = selectedFeature.get('type');
    const name = selectedFeature.get('name');
    if (type === 'new-path') {
        SelectNewRouteFeature(name);
        map.addInteraction(mapModifyInteraction);
    } else if (type === 'new-busstop') {
        SelectNewBusStopFeature(name);
        map.addInteraction(mapModifyInteraction);
    } else if (type === 'busstop') {
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

//
// Map export functions
//

async function ExportData() {
    let data = await APIGetRequest(dataAPI.main);
    data = JSON.stringify(data);
    let date = new Date().toLocaleString();
    date = date.concat(')');
    date = date.replace(', ', '(');
    date = date.replaceAll('.', '-');
    date = date.replaceAll(':', '-');
    DownloadJSON(data, 'data-' + date + '.json', 'text/plain');
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

function SearchFilterList(container, searchValue) {
    searchValue = searchValue.toLowerCase();
    const childrens = container.children;
    let applyFilter = false;
    if (searchValue.length > 0) applyFilter = true;
    for (let i = 0; i < childrens.length; i++) {
        if (applyFilter && childrens[i].innerHTML.toLowerCase().indexOf(searchValue) < 0) {
            childrens[i].classList.add('d-none');
        } else {
            childrens[i].classList.remove('d-none');
        }
    }
}

let selectedSidebar;

const editViewSidebars = {
    "tools": document.getElementById('tools-sidebar'),
    "route-tools": document.getElementById('route-tools-sidebar'),
    "route-new": document.getElementById('route-new-sidebar'),
    "route-list": document.getElementById('route-list-sidebar'),
    "busstop-tools": document.getElementById('busstop-tools-sidebar'),
    "busstop-new": document.getElementById('busstop-new-sidebar'),
    "busstop-list": document.getElementById('busstop-list-sidebar'),
    "transport-tools": document.getElementById('transport-tools-sidebar'),
    "transport-new": document.getElementById('transport-new-sidebar'),
    "transport-list": document.getElementById('transport-list-sidebar'),
}

function SelectToolSidebar(sidebar) {
    DeleteNewBusStop();
    ClearNewRoute();
    for (const [name, element] of Object.entries(editViewSidebars)) {
        element.classList.add('d-none');
    }
    if (sidebar !== '') {
        editViewSidebars[sidebar].classList.remove('d-none');
        selectToolSidebar = sidebar;
    }
    else {
        editViewSidebars.tools.classList.remove('d-none');
        selectToolSidebar = editViewSidebars.tools;
    }
}