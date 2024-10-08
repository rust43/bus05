//
// BusStop edit functions
//

// vars for edit functions
let editedBusstop = null;

const selectBusstopData = function (busStopId) {
  if (busStopId === '' || busStopId === null) return;
  editedBusstop = busstops.getBusstop(busStopId);
  document.getElementById('busstop-data').classList.remove('d-none');
  document.getElementById('selected-busstop-name').value = editedBusstop.name;
  document.getElementById('show-busstop-location-button').onclick = function () {
    editBusstopFeature(editedBusstop.location.point.id);
  };
};

// Select function for busstop feature id
const editBusstopFeature = function (busstopFeatureId) {
  const busstopFeature = busstops.getFeature(busstopFeatureId);
  if (!busstopFeature) return;
  editMode = 'busstop-location-edit';
  olSelectFeature(busstopFeature);
  olPanToFeature(busstopFeature);
};

//
// BusStop edit helper functions
//

const getSelectedBusstop = function (busStopId) {
  let loadedBusstops = busstops.get();
  for (let i = 0; i < loadedBusstops.length; i++) {
    if (loadedBusstops[i].id === busStopId) return loadedBusstops[i];
  }
  return null;
};

//
// BusStop save functions
//

const saveBusstop = function () {
  if (editedBusstop === null) return;
  let name = document.getElementById('selected-busstop-name').value;
  let feature = busstops.getFeature(editedBusstop.location.point.id);
  let features = [feature];
  let geoJSONwriter = new olGeoJSON();
  let geoJSONdata = geoJSONwriter.writeFeatures(features, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
  const busstop_data = {
    name: name,
    geojson_data: geoJSONdata
  };
  APIPutRequest(busstop_data, busstopAPI.main).then(function () {
    try {
      document.getElementById('busstop-data').classList.add('d-none');
      fillBusstopList(true).then(function () {
        busstops.displayFeatures();
      });
      alert('Изменения сохранены!');
    } catch (err) {
      alert('Ошибка при загрузке новых остановок!');
    }
  });
};

//
// BusStop delete functions
//

const deleteBusstop = function () {
  if (editedBusstop === null) return;
  let busStopId = editedBusstop.id;
  const busstop_data = {
    busstop_id: busStopId
  };
  APIDeleteRequest(busstop_data, busstopAPI.main).then(function () {
    alert('Остановка удалена!');
    try {
      document.getElementById('busstop-data').classList.add('d-none');
      document.getElementById('search-busstop-input').value = '';
      fillBusstopList(true).then(function () {
        busstops.displayFeatures();
      });
    } catch (err) {
      alert('Ошибка при загрузке новых остановок!');
    }
  });
};
