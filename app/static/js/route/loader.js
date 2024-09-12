//
// Route layer loader file
//

const routes = (function () {
  let routeVectorSource = new olVectorSource({ wrapX: false });
  let routeVectorLayer = new olVectorLayer({ source: routeVectorSource, style: mapStyleFunction });
  let loadedRoutes = null;
  map.addLayer(routeVectorLayer);

  return {
    async load() {
      loadedRoutes = await APIGetRequest(routeAPI.main);
    },

    clearLayer() {
      routeVectorSource.clear();
    },

    get() {
      return loadedRoutes;
    },

    getRoute(routeId) {
      if (loadedRoutes === null) return null;
      for (let i = 0; i < loadedRoutes.length; i++) {
        if (loadedRoutes[i].id === routeId) return loadedRoutes[i];
      }
      return null;
    },

    getPathFeature(featureId) {
      return routeVectorSource.getFeatureById(featureId);
    },

    displayRoute(routeId) {
      this.clearLayer();
      const route = this.getRoute(routeId);
      if (route === null) return;
      this.displayRoutePath(route.path_a.line.id, route.id, 'route-' + route.id + '-path-a', route.path_a.line.geom);
      this.displayRoutePath(route.path_b.line.id, route.id, 'route-' + route.id + '-path-b', route.path_b.line.geom);
    },

    displayAllRoutes() {
      this.clearLayer();
      for (let i = 0; i < loadedRoutes.length; i++) {
        this.displayRoute(loadedRoutes[i].id);
      }
    },

    displayRoutePath(id, route_id, name, geom) {
      let coordinates = new olLineStringGeometry(geom.coordinates);
      coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
      const routeFeature = new olFeature({
        geometry: coordinates,
        type: geom.type,
        name: name
      });
      routeFeature.setId(id);
      routeFeature.set('type', 'path');
      routeFeature.set('map_object_id', route_id);
      routeVectorSource.addFeature(routeFeature);
    }
  };
})();

routes.load();

const fillRouteList = async function () {
  document.getElementById('route-edit-data').classList.add('d-none');
  await routes.load();
  let loadedRoutes = routes.get();
  const routeListContainer = document.getElementById('route-list');
  if (routeListContainer) routeListContainer.innerHTML = '';
  else return;
  for (let i = 0; i < loadedRoutes.length; i++) {
    const route = loadedRoutes[i];
    // add button to view route
    const routeButton = document.createElement('button');
    const routeButtonText = document.createTextNode(route.name);
    if (routeListContainer) {
      routeButton.appendChild(routeButtonText);
      routeButton.classList.add('btn', 'badge', 'text-bg-success');
      routeButton.onclick = function () {
        routeEdit.selectRouteData(route.id);
      };
      routeListContainer.appendChild(routeButton);
    }
  }
};
