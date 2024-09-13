//
// Route edit functions
//

const editRoute = (function () {
  let editedRoute = null;
  let path_a_stops = [];
  let path_b_stops = [];
  const fields = {
    id: 'edit-route-id',
    name: 'edit-route-name',
    typeDiv: 'edit-route-type',
    typeSelect: 'edit-route-type-select',
    typeField: 'edit-route-type-field',
    typeInput: 'edit-route-type-input'
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
      if (select.value === 'edit-route-type-new') {
        routeType = this.interface(fields.typeInput).value;
      } else {
        routeType = select.value;
      }

      const route_data = {
        name: this.interface(fields.name).value,
        geojson_data: geoJSONdata,
        path_a_stops: path_a_stops,
        path_b_stops: path_b_stops,
        route_type: routeType
      };
      APIPutRequest(route_data, routeAPI.main).then(function () {
        try {
          fillRouteList().then(function () {
            editRoute.selectRouteData(editedRoute.id);
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
      if (select.value === 'edit-route-type-new') {
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
      path_a_stops = [];
      path_b_stops = [];
    },

    async selectRouteData(routeId) {
      if (routeId === '') return;
      if (additionalSidebar.visible()) additionalSidebar.toggle();
      this.clearForm();
      routes.displayRoute(routeId);
      editedRoute = routes.getRoute(routeId);
      path_a_stops = editedRoute.path_a_stops;
      path_b_stops = editedRoute.path_b_stops;
      this.interface(fields.name).value = editedRoute.name;
      this.interface(fields.id).value = editedRoute.id;
      await this.fillTypeSelect();
      if (editedRoute.route_type !== null) {
        this.interface(fields.typeSelect).value = editedRoute.route_type.id;
      }
      document.getElementById('edit-route-path-a').onclick = function () {
        editRoute.editPathFeature(editedRoute.path_a.line.id);
      };
      document.getElementById('edit-route-path-b').onclick = function () {
        editRoute.editPathFeature(editedRoute.path_b.line.id);
      };
      document.getElementById('edit-route-data').classList.remove('d-none');
    },

    editPathFeature(pathFeatureId) {
      const pathFeature = routes.getPathFeature(pathFeatureId);
      if (!pathFeature) return;
      editMode = 'route-path-edit';
      olSelectFeature(pathFeature);
    },

    showBusstops(direction) {
      if (direction === 'path-a') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении А', path_a_stops);
      } else if (direction === 'path-b') {
        asFillRouteData(direction, this.selectBusstop, 'Остановки в направлении B', path_b_stops);
      }
      if (!additionalSidebar.visible()) additionalSidebar.toggle();
    },

    deleteRoute() {
      let routeId = this.interface(fields.id).value;
      const route_data = { route_id: routeId };
      APIDeleteRequest(route_data, routeAPI.main).then(function () {
        try {
          fillRouteList().then(() => {
            document.getElementById('edit-route-data').classList.add('d-none');
            alert('Маршрут удален!');
          });
        } catch (err) {
          alert('Ошибка при удалении маршрута!');
        }
      });
    },

    removeBusstop(busstopId, stopList) {
      for (let i = 0; i < stopList.length; i++) {
        if (stopList[i].id === busstopId) stopList.splice(i, 1);
        break;
      }
    },

    async fillTypeSelect() {
      await APIGetRequest(routeAPI.type).then((data) => {
        const routeTypeSelect = bs_select_new(
          'edit-route-type',
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
        editMode = 'edit-route-add-busstop-path-a';
      } else if (direction === 'path-b') {
        editMode = 'edit-route-add-busstop-path-b';
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
