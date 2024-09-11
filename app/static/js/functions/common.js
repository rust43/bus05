const inputClearHelper = (input) => {
  if (!input) return;
  input.value = '';
  input.classList.remove('is-valid');
  input.classList.remove('is-invalid');
};

const selectClearHelper = function (select) {
  select.selectedIndex = 0;
  select.classList.remove('is-valid');
  select.classList.remove('is-invalid');
};

const validationHelper = function (field) {
  if (!field) return false;
  if (field.value) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    return true;
  } else {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    return false;
  }
};

const featureDrawClearHelper = (feature, vectorSource, input, flag = null, callback = null) => {
  if (feature !== null) {
    vectorSource.removeFeature(feature);
  }
  inputClearHelper(input);
  if (flag !== null && callback !== null) {
    callback(flag);
  }
};

const drawTypes = {
  point: 'Point',
  line: 'LineString'
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

const clearDict = (dict) => {
  for (var prop in dict) {
    if (dict.hasOwnProperty(prop)) delete dict[prop];
  }
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

const docGetElement = function (id) {
  return document.getElementById(id);
};
