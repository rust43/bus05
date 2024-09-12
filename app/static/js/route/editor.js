//
// Route edit functions
//

const routeEdit = (function () {
  let editedRoute = null;
  let aStops = null;
  let bStops = null;
  const fields = {
    id: 'route-edit-id',
    name: 'route-edit-name',
    typeDiv: 'route-edit-type',
    typeSelect: 'route-edit-type-select',
    typeField: 'route-edit-type-field',
    typeInput: 'route-edit-type-input'
  };

  return {
    interface(field) {
      return document.getElementById(field);
    },

    saveRoute() {
      if (editedRoute === null) return;
      if (!this.formValidation()) {
        alert('Проверьте данные редактируемого маршрута!');
        return;
      }

      let route_path_a = routes.getPathFeature(editedRoute.path_a.line.id, 'path-a');
      let route_path_b = routes.getPathFeature(editedRoute.path_b.line.id, 'path-b');
      if (route_path_a === null || route_path_b === null) {
        alert('Укажите направления маршрута!');
        return;
      }

      let features = [route_path_a, route_path_b];
      let geoJSONwriter = new olGeoJSON();
      let geoJSONdata = geoJSONwriter.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });

      let routeType = '';
      let select = this.interface(fields.typeSelect);
      if (select.value === 'route-edit-type-new') {
        routeType = this.interface(fields.typeInput).value;
      } else {
        routeType = select.value;
      }

      const route_data = {
        name: this.interface(fields.name).value,
        geojson_data: geoJSONdata,
        path_a_stops: aStops,
        path_b_stops: bStops,
        route_type: routeType
      };
      APIPutRequest(route_data, routeAPI.main).then(function () {
        try {
          fillRouteList().then(function () {
            routeEdit.selectRouteData(editedRoute.id);
            alert('Изменения сохранены!');
          });
        } catch (err) {
          alert('Ошибка при сохранении данных маршрута!');
        }
      });
    },

    formValidation() {
      let result = true;
      result *= validationHelper(this.interface(fields.name));
      let select = this.interface(fields.typeSelect);
      if (select.value === 'route-edit-type-new') {
        result *= validationHelper(this.interface(fields.typeInput));
      } else {
        result *= validationHelper(select);
      }
      return result;
    },

    clearForm() {
      cancelDraw();
      inputClearHelper(this.interface(fields.id));
      inputClearHelper(this.interface(fields.name));
      let typeSelect = this.interface(fields.typeSelect);
      if (typeSelect) {
        selectClearHelper(typeSelect);
        this.interface(fields.typeField).classList.add('d-none');
      }
      let typeInput = this.interface(fields.typeInput);
      if (typeInput) inputClearHelper(typeInput);
      editedRoute = null;
      clearDict(aStops);
      clearDict(bStops);
      aStops = null;
      bStops = null;
    },

    async selectRouteData(routeId) {
      if (routeId === '') return;
      this.clearForm();
      routes.displayRoute(routeId);
      editedRoute = routes.getRoute(routeId);

      clearDict(aStops);
      clearDict(bStops);
      aStops = convertToDict(editedRoute.path_a_stops);
      bStops = convertToDict(editedRoute.path_b_stops);

      this.interface(fields.name).value = editedRoute.name;
      this.interface(fields.id).value = editedRoute.id;

      await this.fillTypeSelect();
      if (editedRoute.route_type !== null) {
        this.interface(fields.typeSelect).value = editedRoute.route_type.id;
      }
      document.getElementById('route-edit-path-a').onclick = function () {
        routeEdit.editPathFeature(editedRoute.path_a.line.id);
      };
      document.getElementById('route-edit-path-b').onclick = function () {
        routeEdit.editPathFeature(editedRoute.path_b.line.id);
      };
      document.getElementById('route-edit-data').classList.remove('d-none');
    },

    editPathFeature(pathFeatureId) {
      const pathFeature = routes.getPathFeature(pathFeatureId);
      if (!pathFeature) return;
      editMode = 'route-path-edit';
      olSelectFeature(pathFeature);
    },

    showBusstops(direction) {
      if (direction === 'path-a') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении А', aStops);
      } else if (direction === 'path-b') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении B', bStops);
      }
      if (!additionalSidebarVisible) toggleAdditionalSidebar();
    },

    deleteRoute() {
      let routeId = this.interface(fields.id).value;
      const route_data = { route_id: routeId };
      APIDeleteRequest(route_data, routeAPI.main).then(function () {
        try {
          fillRouteList().then(() => {
            document.getElementById('route-edit-data').classList.add('d-none');
            alert('Маршрут удален!');
          });
        } catch (err) {
          alert('Ошибка при удалении маршрута!');
        }
      });
    },

    deleteBusstop(busStopId) {
      delete aStops[busStopId];
      delete bStops[busStopId];
    },

    async fillTypeSelect() {
      await APIGetRequest(routeAPI.type).then((data) => {
        const routeTypeSelect = bs_select_new(
          'route-edit-type',
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

    selectBusstop(direction) {
      cancelDraw();
      if (direction === 'path-a') {
        editMode = 'route-edit-add-busstop-path-a';
      } else if (direction === 'path-b') {
        editMode = 'route-edit-add-busstop-path-b';
      }
    },

    addBusstop(busstopFeature, direction) {
      const name = busstopFeature.get('busstop_name');
      const object_id = busstopFeature.get('map_object_id');
      if (direction === 'path-a') {
        if (bStops) delete bStops[object_id];
        aStops[object_id] = name;
      } else if (direction === 'path-b') {
        if (aStops) delete aStops[object_id];
        bStops[object_id] = name;
      }
      asRouteAddBusstop(object_id, name);
    }
  };
})();

// Select function for path feature id

function FillBusStopsContainer(stopsDict, container, newRoute) {
  container.innerHTML = '';
  let busstopBadge = null;
  let busstopBadgeText = null;
  if (Object.keys(stopsDict).length === 0) {
    busstopBadge = document.createElement('SPAN');
    busstopBadgeText = document.createTextNode('Отсутствуют');
    busstopBadge.appendChild(busstopBadgeText);
    busstopBadge.classList.add('badge', 'text-bg-secondary');
    container.appendChild(busstopBadge);
  } else {
    for (let key in stopsDict) {
      busstopBadge = document.createElement('SPAN');
      busstopBadgeText = document.createTextNode(stopsDict[key]);
      busstopBadgeButton = document.createElement('BUTTON');
      busstopBadgeButton.classList.add('btn-close', 'ms-1');
      busstopBadge.appendChild(busstopBadgeText);
      busstopBadge.appendChild(busstopBadgeButton);
      busstopBadge.classList.add('badge', 'text-bg-success', 'd-flex', 'align-items-center');
      if (newRoute) {
        busstopBadge.onclick = function () {
          DeleteNewRouteBusStop(key);
        };
      } else {
        busstopBadge.onclick = function () {
          DeleteRouteBusStop(key);
        };
      }
      container.appendChild(busstopBadge);
    }
  }
}
