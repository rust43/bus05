// New Route creator file

// ---------------------------
// Route map layers definition
// ---------------------------

const newRoute = (function () {
  // New route layer definition
  let newRouteVectorSource = new olVectorSource({ wrapX: false });
  let newRouteVectorLayer = new olVectorLayer({ source: newRouteVectorSource, style: mapStyleFunction });
  map.addLayer(newRouteVectorLayer);
  // Vars for keep new route features
  let path_a = null;
  let path_b = null;
  // let path_a_stops = {};
  // let path_b_stops = {};
  let path_a_stops = [];
  let path_b_stops = [];

  const fields = {
    name: 'new-route-name',
    pathA: 'new-route-path-a',
    pathB: 'new-route-path-b',
    pathAFlag: 'new-route-path-a-flag',
    pathBFlag: 'new-route-path-b-flag',
    typeDiv: 'new-route-type',
    typeSelect: 'new-route-type-select',
    typeField: 'new-route-type-field',
    typeInput: 'new-route-type-input'
  };

  return {
    interface(field) {
      return docGetElement(field);
    },

    // new route map draw function
    drawRoute(routeName) {
      startDraw(newRouteVectorSource, drawTypes.line);
      mapDrawInteraction.on('drawend', function (e) {
        const feature = e.feature;
        feature.set('name', routeName);
        feature.set('type', 'new-path');
        newRoute.routeValidation(routeName, feature);
        olSelectFeature(feature);
        cancelDraw();
      });
      map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
    },

    selectBusstop(direction) {
      cancelDraw();
      if (direction === 'path-a') {
        editMode = 'new-route-add-busstop-path-a';
      } else if (direction === 'path-b') {
        editMode = 'new-route-add-busstop-path-b';
      }
    },

    addBusstop(busstopFeature, direction) {
      const name = busstopFeature.get('busstop_name');
      const object_id = busstopFeature.get('map_object_id');
      if (direction === 'path-a') {
        this.removeBusstop(object_id, path_b_stops);
        path_a_stops.push({
          id: object_id,
          name: name
        });
      } else if (direction === 'path-b') {
        this.removeBusstop(object_id, path_a_stops);
        path_b_stops.push({
          id: object_id,
          name: name
        });
      }
      asRouteAddBusstop(object_id, name);
    },

    removeBusstop(busstopId, stopList) {
      for (let i = 0; i < stopList.length; i++) {
        if (stopList[i].id === busstopId) stopList.splice(i, 1);
        break;
      }
    },

    // new route map delete feature functions
    removeSelectedFeature() {
      if (selectedFeature === null) return;
      let name = selectedFeature.get('name');
      if (name === 'path-a') {
        newRouteVectorSource.removeFeature(path_a);
        this.routeInvalidation(this.interface(fields.pathAFlag));
        inputClearHelper(this.interface(fields.pathA));
        path_a = null;
      } else if (name === 'path-b') {
        newRouteVectorSource.removeFeature(path_b);
        this.routeInvalidation(this.interface(fields.pathBFlag));
        inputClearHelper(this.interface(fields.pathB));
        path_b = null;
      }
      selectedFeature = null;
    },

    showBusstops(direction) {
      if (direction === 'path-a') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении А', path_a_stops);
      } else if (direction === 'path-b') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении B', path_b_stops);
      }
      if (!additionalSidebar.visible()) additionalSidebar.toggle();
    },

    clearForm() {
      cancelDraw();
      selectedFeature = null;
      inputClearHelper(this.interface(fields.name));
      let typeSelect = this.interface(fields.typeSelect);
      if (typeSelect) {
        selectClearHelper(typeSelect);
        this.interface(fields.typeField).classList.add('d-none');
      }
      let typeInput = this.interface(fields.typeInput);
      if (typeInput) inputClearHelper(typeInput);
      inputClearHelper(this.interface(fields.pathA));
      inputClearHelper(this.interface(fields.pathB));
      newRouteVectorSource.removeFeature(path_a);
      newRouteVectorSource.removeFeature(path_b);
      this.routeInvalidation(this.interface(fields.pathAFlag));
      this.routeInvalidation(this.interface(fields.pathBFlag));
      path_a = null;
      path_b = null;
      path_a_stops = [];
      path_b_stops = [];
    },

    async fillForm() {
      this.clearForm();
      let nameInput = this.interface(fields.name);
      nameInput.onchange = function () {
        validationHelper(nameInput);
      };
      await this.fillTypeSelect();
    },

    async fillTypeSelect() {
      await APIGetRequest(routeAPI.type).then((data) => {
        const routeTypeSelect = bs_select_new(
          'new-route-type',
          'Тип транспорта маршрута',
          '',
          'text',
          data,
          true,
          'Укажите тип транспорта маршрута',
          'Данный тип транспорта уже указан'
        );
        const routeTypeDiv = this.interface(fields.typeDiv);
        routeTypeDiv.innerHTML = '';
        routeTypeDiv.replaceWith(routeTypeSelect);
      });
    },

    selectFeature(routeName) {
      flag = document.getElementById(routeName + '-flag');
      if (flag === null) return;
      flag.classList.remove('text-bg-success');
      flag.classList.add('text-bg-primary');
      flag.innerText = 'Выбрано';
    },

    unselectFeature(routeName) {
      flag = document.getElementById(routeName + '-flag');
      if (flag === null) return;
      flag.classList.remove('text-bg-primary');
      flag.classList.add('text-bg-success');
      flag.innerText = 'Указано';
    },

    // new route validation functions
    routeValidation(routeName, feature) {
      flag = document.getElementById(routeName + '-flag');
      if (flag === null) return;
      flag.classList.remove('text-bg-danger');
      flag.classList.add('text-bg-success');
      flag.innerText = 'Указано';
      this.setRouteFeature(routeName, feature);
    },

    routeInvalidation(flag) {
      if (flag === null) return;
      flag.classList.remove('text-bg-success');
      flag.classList.add('text-bg-danger');
      flag.innerText = 'Не указано';
    },

    formValidation() {
      let result = true;
      result *= validationHelper(this.interface(fields.name));
      result *= validationHelper(this.interface(fields.pathA));
      result *= validationHelper(this.interface(fields.pathB));
      let select = this.interface(fields.typeSelect);
      if (select.value === 'new-route-type-new') {
        result *= validationHelper(this.interface(fields.typeInput));
      } else {
        result *= validationHelper(select);
      }
      return result;
    },

    setRouteFeature(routeName, feature) {
      if (routeName === 'new-route-path-a') {
        if (path_a !== null) newRouteVectorSource.removeFeature(path_a);
        path_a = feature;
        this.interface(fields.pathA).value = 'set';
        validationHelper(this.interface(fields.pathA));
      } else if (routeName === 'new-route-path-b') {
        if (path_b !== null) newRouteVectorSource.removeFeature(path_b);
        path_b = feature;
        this.interface(fields.pathB).value = 'set';
        validationHelper(this.interface(fields.pathB));
      }
    },

    async saveNewRoute() {
      if (!this.formValidation()) {
        alert('Проверьте данные нового маршрута!');
        return;
      }

      let features = [path_a, path_b];
      let geoJSONwriter = new olGeoJSON();
      let geoJSONdata = geoJSONwriter.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });

      let route_type = '';
      let select = this.interface(fields.typeSelect);
      if (select.value === 'new-route-type-new') {
        route_type = this.interface(fields.typeInput).value;
      } else {
        route_type = select.value;
      }

      const route_data = {
        name: this.interface(fields.name).value,
        geojson_data: geoJSONdata,
        path_a_stops: path_a_stops,
        path_b_stops: path_b_stops,
        route_type: route_type
      };

      APIPostRequest(route_data, routeAPI.main).then(async function () {
        try {
          await routes.load();
          newRoute.clearForm();
          newRoute.fillForm();
          alert('Маршрут сохранен!');
        } catch (e) {
          alert('Ошибка при сохранении нового маршрута!');
        }
      });
    }
  };
})();

// ----------------------------------
// Route map delete feature functions
// ----------------------------------

const deleteNewRouteFeature = function (e) {
  if (e.keyCode !== 46) return;
  newRoute.removeSelectedFeature();
};
document.addEventListener('keydown', deleteNewRouteFeature, false);

const continueDrawRouteFeature = function (e) {
  if (e.keyCode !== 16) return;
  if (mapSelectInteraction === null) return;
  let feature = mapSelectInteraction.getFeatures().item(0);
  if (!feature) return;
  const routeName = feature.get('name');
  const type = feature.get('type');
  if (type !== 'new-path' && type !== 'path') return;
  let vectorSource = mapSelectInteraction.getLayer(selectedFeature).getSource();
  // remove existing feature from map
  vectorSource.removeFeature(feature);
  startDraw(vectorSource, drawTypes.line);
  mapDrawInteraction.extend(feature);
  mapDrawInteraction.on('drawend', function (e) {
    feature = e.feature;
    feature.set('name', routeName);
    feature.set('type', type);
    newRoute.routeValidation(routeName, feature);
    cancelDraw();
    olSelectFeature(feature);
  });
  map.getInteractions().extend([mapDrawInteraction, mapSnapInteraction]);
};
document.addEventListener('keydown', continueDrawRouteFeature, false);
