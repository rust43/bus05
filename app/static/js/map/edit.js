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
    if (selectedFeature.get('type') === 'new-path') newRoute.unselectFeature(selectedFeature.get('name'));
    else if (selectedFeature.get('type') === 'new-busstop') UnselectNewBusStopFeature(selectedFeature.get('name'));
    selectedFeature = null;
  }
  if (!feature) return;
  selectedFeature = feature;
  const type = selectedFeature.get('type');
  const name = selectedFeature.get('name');
  if (type === 'new-path') {
    newRoute.selectFeature(name);
    map.addInteraction(mapModifyInteraction);
  } else if (type === 'new-busstop') {
    SelectNewBusStopFeature(name);
    map.addInteraction(mapModifyInteraction);
  } else if (type === 'busstop') {
    if (editMode === 'route-new-add-busstop-path-a') {
      newRoute.addBusstop(feature, 'path-a');
    } else if (editMode === 'route-new-add-busstop-path-b') {
      newRoute.addBusstop(feature, 'path-b');
    } else if (editMode === 'route-edit-add-busstop-path-a') {
      routeEdit.addBusstop(feature, 'path-a');
      // AddRouteBusstop(feature, 'path-a');
    } else if (editMode === 'route-edit-add-busstop-path-b') {
      routeEdit.addBusstop(feature, 'path-b');
      // AddRouteBusstop(feature, 'path-b');
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

const removeLastPoint = function (e) {
  if (e.keyCode !== 8) return;
  if (mapDrawInteraction === null) return;
  mapDrawInteraction.removeLastPoint();
};
document.addEventListener('keydown', removeLastPoint, false);

// --------------------------
// Color conversion functions
// --------------------------

function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (alpha) return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  else return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function rgbToHex(rgb) {
  let r = rgb.split(',')[0],
    g = rgb.split(',')[1],
    b = rgb.split(',')[2];
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
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

const drawTypes = {
  point: 'Point',
  line: 'LineString'
};

const createFeatures = function (list, namePrefix, nameField, type) {
  let features = [];
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    let geometry = new olPointGeometry(element.location.point.geom.coordinates);
    geometry = geometry.transform('EPSG:4326', 'EPSG:3857');
    const feature = new olFeature({
      geometry: geometry,
      type: element.location.point.geom.type,
      name: namePrefix + element.id
    });
    feature.setId(element.location.point.id);
    feature.set('type', type);
    feature.set('map_object_id', element.id);
    feature.set(nameField, element.name);
    features.push(feature);
  }
  return features;
};

const startDraw = (vectorSource, type) => {
  // removing interactions before draw
  map.removeInteraction(mapSelectInteraction);
  map.removeInteraction(mapModifyInteraction);
  map.removeInteraction(mapDrawInteraction);
  map.removeInteraction(mapSnapInteraction);
  mapDrawInteraction = new olDrawInteraction({ source: vectorSource, type: type, pixelTolerance: 50 });
  mapSnapInteraction = new olSnapInteraction({ source: vectorSource });
};

const cancelDraw = () => {
  map.removeInteraction(mapDrawInteraction);
  map.removeInteraction(mapSnapInteraction);
  map.addInteraction(mapSelectInteraction);
};

let selectedSidebar;

const editViewSidebars = {
  tools: document.getElementById('tools-sidebar'),
  route_tools: document.getElementById('route-tools-sidebar'),
  route_new: document.getElementById('route-new-sidebar'),
  route_list: document.getElementById('route-list-sidebar'),
  busstop_tools: document.getElementById('busstop-tools-sidebar'),
  busstop_new: document.getElementById('busstop-new-sidebar'),
  busstop_list: document.getElementById('busstop-list-sidebar'),
  transport_tools: document.getElementById('transport-tools-sidebar'),
  transport_new: document.getElementById('transport-new-sidebar'),
  transport_list: document.getElementById('transport-list-sidebar')
};

function SelectToolSidebar(sidebar) {
  DeleteNewBusStop();
  for (const [name, element] of Object.entries(editViewSidebars)) {
    element.classList.add('d-none');
  }
  if (sidebar !== '') {
    editViewSidebars[sidebar].classList.remove('d-none');
    selectToolSidebar = sidebar;
  } else {
    editViewSidebars.tools.classList.remove('d-none');
    selectToolSidebar = editViewSidebars.tools;
  }
}
