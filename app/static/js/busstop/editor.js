//
// BusStop edit functions
//

// vars for edit functions
let editedBusStop = null;

function SelectBusStopData(busStopId) {
    if (busStopId === '' || busStopId === null) return;
    editedBusStop = GetSelectedBusStop(busStopId);
    document.getElementById('busstop-data').classList.remove('d-none');
    document.getElementById('selected-busstop-name').value = editedBusStop.name;
    document.getElementById('show-busstop-location-button').onclick = function () {
        EditBusStopFeature(editedBusStop.location.point.id);
    };
}

// Select function for busstop feature id
function EditBusStopFeature(busStopFeatureId) {
    const busStopFeature = busStopsVectorSource.getFeatureById(busStopFeatureId);
    if (!busStopFeature) return;
    editMode = 'busstop-location-edit';
    mapSelectInteraction.getFeatures().clear();
    mapSelectInteraction.getFeatures().push(busStopFeature);
    mapSelectInteraction.dispatchEvent({
        type: 'select',
        selected: [busStopFeature],
        deselected: []
    });
    PanToFeature(busStopFeature);
}

//
// BusStop edit helper functions
//

function GetSelectedBusStop(busStopId) {
    for (let i = 0; i < loadedBusStops.length; i++) {
        if (loadedBusStops[i].id === busStopId)
            return loadedBusStops[i];
    }
    return null;
}

//
// BusStop save functions
//

function SaveBusStop() {
    if (editedBusStop === null)
        return;
    let name = document.getElementById('selected-busstop-name').value;
    let location = busStopsVectorSource.getFeatureById(editedBusStop.location.point.id);
    let features = [location];
    let geoJSONwriter = new olGeoJSON();
    let geoJSONdata = geoJSONwriter.writeFeatures(
        features,
        { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
    );
    const busstop_data = {
        'name': name,
        'geojson_data': geoJSONdata,
    };
    APIPutRequest(busstop_data, busstopAPI.main).then(function () {
        try {
            document.getElementById('busstop-data').classList.add('d-none');
            FillBusstopList().then(function () {
                DisplayBusStops();
            });
            alert('Изменения сохранены!');
        } catch (err) {
            alert('Ошибка при загрузке новых остановок!');
        }
    });
}

//
// BusStop delete functions
//

function DeleteBusStop() {
    if (editedBusStop === null)
        return;
    let busStopId = editedBusStop.id;
    const busstop_data = {
        'busstop_id': busStopId
    };
    APIDeleteRequest(busstop_data, busstopAPI.main).then(function () {
        alert('Остановка удалена!');
        try {
            document.getElementById('busstop-data').classList.add('d-none');
            document.getElementById('search-busstop-input').value = '';
            FillBusstopList().then(function () {
                DisplayBusStops();
            });
        } catch (err) {
            alert('Ошибка при загрузке новых остановок!');
        }
    });
}