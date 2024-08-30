//
// BusStop layer loader file
//

let busStopsVectorSource = new olVectorSource({ wrapX: false });
let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: mapStyleFunction });
map.addLayer(busStopsVectorLayer);

let loadedBusStops = null;

async function LoadBusStops() {
    loadedBusStops = await APIGetRequest(busstopAPI.main);
}

async function FillBusstopList() {
    const busstopListContainer = document.getElementById('busstop-list');
    if (busstopListContainer) busstopListContainer.innerHTML = '';
    else return;
    document.getElementById('search-busstop-input').disabled = true;
    document.getElementById('search-busstop-input').value = '';
    busstopListContainer.innerHTML = '<div class="spinner-border text-success m-auto" role="status"></div>';
    await LoadBusStops();
    if (loadedBusStops.length === 0) return;
    let busstopsHTML = "";
    for (let i = 0; i < loadedBusStops.length; i++) {
        const busstop = loadedBusStops[i];
        let button = `<button class="btn badge text-bg-success" onclick=SelectBusStopData("${busstop.id}");>${busstop.name}</button>`;
        busstopsHTML += button;
    }
    busstopListContainer.innerHTML = busstopsHTML;
    document.getElementById('search-busstop-input').disabled = false;
}

async function DisplayBusStops() {
    await LoadBusStops();
    let features = [];
    if (loadedBusStops.length === 0) return;
    for (let i = 0; i < loadedBusStops.length; i++) {
        const busStop = loadedBusStops[i];
        let coordinates = new olPointGeometry(busStop.location.point.geom.coordinates);
        coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
        const busStopFeature = new olFeature({
            geometry: coordinates, type: busStop.location.point.geom.type, name: 'busstop-' + busStop.id
        });
        busStopFeature.setId(busStop.location.point.id);
        busStopFeature.set('type', 'busstop');
        busStopFeature.set('map_object_id', busStop.id);
        busStopFeature.set('busstop_name', busStop.name);
        features.push(busStopFeature);
    }
    busStopsVectorSource.clear();
    busStopsVectorSource.addFeatures(features);
}

DisplayBusStops();