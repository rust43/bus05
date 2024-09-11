//
// BusStop layer loader file
//

// Busstops layer definition
let busStopsVectorSource = new olVectorSource({ wrapX: false });
let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: mapStyleFunction });

// Adding Busstops layer
map.addLayer(busStopsVectorLayer);

const busstops = (function () {
  let loadedBusstops = [];

  async function loadBusstops() {
    loadedBusstops = await APIGetRequest(busstopAPI.main);
  }
  function count() {
    return loadedBusstops.length;
  }

  return {
    async load() {
      await loadBusstops();
    },
    count() {
      return count();
    },
    get() {
      return loadedBusstops;
    }
  };
})();

busstops.load();

const fillBusstopList = async function () {
  if (busstops.count() === 0) return;
  let loadedBusstops = busstops.get();
  document.getElementById('busstop-data').classList.add('d-none');
  const busstopListContainer = document.getElementById('busstop-list');
  if (busstopListContainer) busstopListContainer.innerHTML = '';
  else return;
  document.getElementById('search-busstop-input').disabled = true;
  document.getElementById('search-busstop-input').value = '';
  busstopListContainer.innerHTML = '<div class="spinner-border text-success m-auto" role="status"></div>';
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < loadedBusstops.length; i++) {
    const busstop = loadedBusstops[i];
    let button = document.createElement('button');
    button.classList.add('btn', 'badge', 'text-bg-success');
    button.onclick = selectBusstopData(busstop.id);
    button.innerText = busstop.name;
    fragment.appendChild(button);
  }
  busstopListContainer.innerHTML = '';
  busstopListContainer.appendChild(fragment);
  document.getElementById('search-busstop-input').disabled = false;
};

const displayBusstops = async function () {
  await busstops.load();
  let loadedBusstops = busstops.get();
  let features = [];
  if (loadedBusstops.length === 0) return;
  for (let i = 0; i < loadedBusstops.length; i++) {
    const busStop = loadedBusstops[i];
    let coordinates = new olPointGeometry(busStop.location.point.geom.coordinates);
    coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
    const busStopFeature = new olFeature({
      geometry: coordinates,
      type: busStop.location.point.geom.type,
      name: 'busstop-' + busStop.id
    });
    busStopFeature.setId(busStop.location.point.id);
    busStopFeature.set('type', 'busstop');
    busStopFeature.set('map_object_id', busStop.id);
    busStopFeature.set('busstop_name', busStop.name);
    features.push(busStopFeature);
  }
  busStopsVectorSource.clear();
  busStopsVectorSource.addFeatures(features);
};

displayBusstops();
