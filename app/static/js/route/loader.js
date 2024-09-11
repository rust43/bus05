//
// Route layer loader file
//

// openlayers layers definition
let routeVectorSource = new olVectorSource({ wrapX: false });
let routeVectorLayer = new olVectorLayer({ source: routeVectorSource, style: mapStyleFunction });

// openlayers adding routes layer
map.addLayer(routeVectorLayer);

const routes = (function () {
  let loadedRoutes = null;

  return {
    async load() {
      loadedRoutes = await APIGetRequest(routeAPI.main);
    },
    get() {
      return loadedRoutes;
    }
  };
})();

routes.load();

const fillRouteList = async function () {
  document.getElementById('route-data').classList.add('d-none');
  await routes.load();
  let loadedRoutes = routes.get();
  const routeListContainer = document.getElementById('route-list');
  if (routeListContainer) routeListContainer.innerHTML = '';
  else return;
  for (let i = 0; i < loadedRoutes.length; i++) {
    const route = loadedRoutes[i];
    // add button to view transport
    const routeButton = document.createElement('button');
    const routeButtonText = document.createTextNode(route.name);
    if (routeListContainer) {
      routeButton.appendChild(routeButtonText);
      routeButton.classList.add('btn', 'badge', 'text-bg-success');
      routeButton.onclick = function () {
        SelectRouteData(route.id);
      };
      routeListContainer.appendChild(routeButton);
    }
  }
};

const displayRoute = function (routeID) {
  routeVectorSource.clear();
  const route = getRoute(routeID);
  if (route === null) return;
  displayRoutePath(route.path_a.line.id, route.id, 'route-' + route.id + '-path-a', route.path_a.line.geom);
  displayRoutePath(route.path_b.line.id, route.id, 'route-' + route.id + '-path-b', route.path_b.line.geom);
};

const displayAllRoutes = function () {
  routeVectorSource.clear();
  if (loadedRoutes.length === 0) return;
  for (let i = 0; i < loadedRoutes.length; i++) {
    const route = loadedRoutes[i];
    displayRoutePath(route.path_a.line.id, route.id, 'route-' + route.id + '-path-a', route.path_a.line.geom);
    displayRoutePath(route.path_b.line.id, route.id, 'route-' + route.id + '-path-b', route.path_b.line.geom);
  }
};

const displayRoutePath = function (id, route_id, name, geom) {
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
};

// helper functions

const getRoute = function (routeID) {
  let loadedRoutes = routes.get();
  if (loadedRoutes === null) return null;
  for (let i = 0; i < loadedRoutes.length; i++) {
    if (loadedRoutes[i].id === routeID) return loadedRoutes[i];
  }
  return null;
};

const clearRouteLayer = function () {
  routeVectorSource.clear();
};
