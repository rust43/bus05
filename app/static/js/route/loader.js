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

    count() {
      if (!loadedRoutes) return 0;
      return loadedRoutes.length;
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
    },

    selectRoute(routeId, direction = 'path-a') {
      this.clearLayer();
      let route = this.getRoute(routeId);
      this.displayRoutePath(route.path_a.line.id, route.id, 'route-' + route.id + '-path-a', route.path_a.line.geom);
      // let feature = this.getPathFeature(route.path_a.line.id);
      // olSelectFeature(feature);
      this.showBusstops(routeId, direction);
    },

    showBusstops(routeId, direction) {
      let route = this.getRoute(routeId);
      if (direction === 'path-a') {
        asFillRouteData(direction, null, route.name, route.path_a_stops, route.route_type.name);
      } else if (direction === 'path-b') {
        asFillRouteData(direction, null, route.name, route.path_b_stops, route.route_type.name);
      }
      if (!additionalSidebar.visible()) additionalSidebar.toggle();
    }
  };
})();

routes.load();

const fillRouteList = async function (refresh = false, edit = true, routeType = null) {
  const routeListContainer = document.getElementById('route-list');
  if (routeListContainer) routeListContainer.innerHTML = '';
  else return;
  routeListContainer.innerHTML = '<div class="spinner-border text-success m-auto" role="status"></div>';
  if (routes.count() === 0 || refresh) await routes.load();
  let loadedRoutes = routes.get();

  let data = document.getElementById('edit-route-data');
  if (data) {
    data.classList.add('d-none');
  }

  let fragment = document.createDocumentFragment();

  for (let i = 0; i < loadedRoutes.length; i++) {
    const route = loadedRoutes[i];
    if (routeType !== null) {
      if (route.route_type === null) continue;
      if (route.route_type.name !== routeType) continue;
    }

    let div = document.createElement('div');
    div.classList.add('route-card', 'btn', 'btn-success');

    let header = document.createElement('h5');
    header.classList.add('route-card-name');
    header.innerHTML = route.name;

    let span = document.createElement('span');
    span.classList.add('route-card-icon');

    let img = document.createElement('i');
    img.classList.add('bi', 'bi-bus-front-fill');

    span.appendChild(img);
    div.appendChild(header);
    div.appendChild(span);

    div.onclick = function () {
      if (edit) {
        editRoute.selectRouteData(route.id);
      } else {
        routes.selectRoute(route.id);
      }
    };

    fragment.appendChild(div);
  }
  routeListContainer.innerHTML = '';
  routeListContainer.appendChild(fragment);
};
