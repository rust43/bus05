let busStopsVectorSource = new olVectorSource({ wrapX: false });
let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: mapStyleFunction });
map.addLayer(busStopsVectorLayer);

let loadedBusStops = null;

function LoadBusStops() {
    GetBusStops().then(busStops => {
        DisplayBusStops(busStops);
    });
}

async function GetBusStops() {
    const url = host + '/api/v1/busstop/';
    let response = await fetch(
        url,
        {
            method: 'get',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }
        });
    if (response.ok) {
        return await response.json();
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

function DisplayBusStops(busStops) {
    loadedBusStops = busStops;
    const busstopListContainer = document.getElementById('busstop-list');
    if (busstopListContainer)
        busstopListContainer.innerHTML = '';
    for (let i = 0; i < busStops.length; i++) {
        const busStop = busStops[i];
        let coordinates = new olPointGeometry(busStop.location.point.geom.coordinates);
        coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
        const busStopFeature = new olFeature({
            geometry: coordinates, type: busStop.location.point.geom.type, name: busStop.name
        });
        busStopFeature.setId(busStop.location.point.id);
        busStopFeature.set('type', 'busstop');
        busStopsVectorSource.addFeature(busStopFeature);

        // add button to view route
        const busstopButton = document.createElement('BUTTON');
        const busstopButtonText = document.createTextNode(busStop.name);
        if (busstopListContainer) {
            busstopButton.appendChild(busstopButtonText);
            busstopButton.classList.add('btn', 'badge', 'text-bg-success');
            busstopButton.onclick = function () {
                SelectBusStopData(busStop.id);
            };
            busstopListContainer.appendChild(busstopButton);
        }
    }
}

LoadBusStops();

// Select function for busstop feature id
function SelectBusStopFeatureByID(busStopFeatureId) {
    const busStopFeature = busStopsVectorSource.getFeatureById(busStopFeatureId);
    if (!busStopFeature) return;
    mapSelectInteraction.getFeatures().clear();
    mapSelectInteraction.getFeatures().push(busStopFeature);
    mapSelectInteraction.dispatchEvent({
        type: 'select',
        selected: [busStopFeature],
        deselected: []
    });
    PanToFeature(busStopFeature);
}