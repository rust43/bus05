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
    SaveBusStopRequest(busstop_data).then(function () {
        alert('Изменения сохранены!');
        try {
            LoadBusStops().then(function () {
                SelectBusStopData(editedBusStop.id);
            });
        } catch (err) {
            alert('Ошибка при загрузке новых остановок!');
        }
    });
}

async function SaveBusStopRequest(busstop_data) {
    const url = host + '/api/v1/busstop/';
    const response = await fetch(
        url,
        {
            method: 'put',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(busstop_data)
        });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

//
// BusStop delete functions
//

function DeleteBusStop() {
    if (editedBusStop === null)
        return;
    let busStopId = editedBusStop.id;
    const busstop_data = {
        'busstop_id': busStopId,
    };
    DeleteBusStopRequest(busstop_data).then(function () {
        alert('Остановка удалена!');
        try {
            document.getElementById('busstop-data').classList.add('d-none');
            LoadBusStops();
        } catch (err) {
            alert('Ошибка при загрузке новых остановок!');
        }
    });
}

async function DeleteBusStopRequest(busstop_data) {
    const url = host + '/api/v1/busstop/';
    const response = await fetch(
        url,
        {
            method: 'delete',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(busstop_data)
        });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}