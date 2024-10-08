//
// BusStop layer loader file
//

const busstops = (function () {
  // Busstops layer definition
  let busStopsVectorSource = new olVectorSource({ wrapX: false });
  let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: mapStyleFunction });
  // Adding Busstops layer
  map.addLayer(busStopsVectorLayer);
  let loadedBusstops = [];

  return {
    async load() {
      loadedBusstops = await APIGetRequest(busstopAPI.main);
    },

    displayFeatures() {
      let features = createFeatures(loadedBusstops, 'busstop-', 'busstop_name', 'busstop');
      busStopsVectorSource.clear();
      busStopsVectorSource.addFeatures(features);
    },

    count() {
      return loadedBusstops.length;
    },

    get() {
      return loadedBusstops;
    },

    getBusstop(busstopId) {
      for (let i = 0; i < loadedBusstops.length; i++) {
        if (loadedBusstops[i].id === busstopId) return loadedBusstops[i];
      }
      return null;
    },

    getFeature(busstopFeatureId) {
      return busStopsVectorSource.getFeatureById(busstopFeatureId);
    }
  };
})();

busstops.load().then(() => {
  busstops.displayFeatures();
});

const fillBusstopList = async function (refresh = false, edit = true) {
  document.getElementById('search-busstop-input').disabled = true;
  document.getElementById('search-busstop-input').value = '';

  const busstopListContainer = document.getElementById('busstop-list');
  if (busstopListContainer) busstopListContainer.innerHTML = '';
  else return;
  busstopListContainer.innerHTML = '<div class="spinner-border text-success m-auto" role="status"></div>';

  if (busstops.count() === 0 || refresh) await busstops.load();
  let loadedBusstops = busstops.get();

  document.getElementById('busstop-data').classList.add('d-none');

  let fragment = document.createDocumentFragment();

  for (let i = 0; i < loadedBusstops.length; i++) {
    const busstop = loadedBusstops[i];
    let button = document.createElement('button');
    button.classList.add('btn', 'badge', 'text-bg-success');
    button.onclick = function () {
      if (edit) {
        selectBusstopData(busstop.id);
      } else {
        let feature = busstops.getFeature(busstop.location.point.id);
        olSelectFeature(feature);
        olPanToFeature(feature);
      }
    };
    button.innerText = busstop.name;
    fragment.appendChild(button);
  }

  busstopListContainer.innerHTML = '';
  busstopListContainer.appendChild(fragment);
  document.getElementById('search-busstop-input').disabled = false;
};
