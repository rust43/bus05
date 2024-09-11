//
// Transport layer loader file
//

// openlayers layers definition
const transportVectorSource = new olVectorSource({ wrapX: false });
const transportVectorLayer = new olVectorLayer({ source: transportVectorSource, style: mapStyleFunction });

// openlayers adding transport layer
map.addLayer(transportVectorLayer);

// var to keep loaded transport list
let loadedTransport = null;
let selectedTransportIMEI = null;
let pauseTransportLoad = false;

async function LoadTransport() {
    loadedTransport = await APIGetRequest(transportAPI.main);
}

LoadTransport().then(function () {
    DisplayTransport();
});

function ClearTransportLayer() {
    transportVectorSource.clear();
}

async function FillTransportList() {
    document.getElementById('transport-data').classList.add('d-none');
    const transportListContainer = document.getElementById('transport-list');
    if (transportListContainer) transportListContainer.innerHTML = '';
    else return;
    document.getElementById('search-transport-input').disabled = true;
    document.getElementById('search-transport-input').value = '';
    transportListContainer.innerHTML = '<div class="spinner-border text-warning m-auto" role="status"></div>';
    await LoadTransport();
    if (loadedTransport.length === 0) return;
    let transportHTML = '';
    for (let i = 0; i < loadedTransport.length; i++) {
        // add button to view transport
        let button = `
            <button class="btn badge ${
                loadedTransport[i].active ? 'text-bg-warning' : 'text-bg-secondary'
            }"onclick=SelectTransportData("${loadedTransport[i].id}");>${loadedTransport[i].name}</button>`;
        transportHTML += button;
    }
    transportListContainer.innerHTML = transportHTML;
    document.getElementById('search-transport-input').disabled = false;
}

async function LoadTransportPoints() {
    if (loadedTransport.length === 0) return;
    let imeiList = [];
    for (let i = 0; i < loadedTransport.length; i++) {
        if (!loadedTransport[i].active) continue;
        imeiList.push(loadedTransport[i].imei);
    }
    const data = { imei: imeiList };
    return await APIPostRequest(data, transportAPI.point);
}

async function DisplayTransport() {
    let pointList = await LoadTransportPoints();
    if (!pointList) return;
    let features = [];
    for (let i = 0; i < pointList.length; i++) {
        const point = pointList[i];
        let coordinates = olFromLonLat([point['lon'], point['lat']]);
        coordinates = new olPointGeometry(coordinates);
        // coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
        const transportFeature = new olFeature({ geometry: coordinates });
        const transport = GetTransport(point.imei);
        if (transport === null) return;
        transportFeature.setId(transport.id);
        transportFeature.set('name', 'transport-' + transport.id);
        transportFeature.set('imei', transport.imei);
        if (selectedTransportIMEI != null && selectedTransportIMEI == transport.imei)
            transportFeature.set('selected', true);
        else transportFeature.set('selected', false);
        transportFeature.set('type', 'transport');
        transportFeature.set('transport_type', transport.transport_type);
        transportFeature.set('course', point['course']);
        transportFeature.set('speed', point.speed);
        transportFeature.set('height', point.height);
        transportFeature.set('sats', point['sats']);
        transportFeature.set('route', transport.route);
        features.push(transportFeature);
    }
    transportVectorSource.clear();
    transportVectorSource.addFeatures(features);
}

// helper functions

function GetTransport(imei) {
    if (loadedTransport.length === 0) return;
    for (let i = 0; i < loadedTransport.length; i++) {
        if (loadedTransport[i].imei === imei) return loadedTransport[i];
    }
    return null;
}

function FillSelect(selectElement, valueList, valueNames = null) {
    selectElement.selectedIndex = 0;
    let i,
        l = selectElement.options.length - 1;
    for (i = l; i >= 1; i--) {
        selectElement.options.remove(i);
    }
    l = valueList.length;
    for (i = 0; i < l; i++) {
        let opt = document.createElement('option');
        if (valueNames !== null) {
            opt.value = valueList[i][valueNames[0]];
            opt.innerHTML = valueList[i][valueNames[1]];
        } else {
            opt.value = valueList[i];
            opt.innerHTML = valueList[i];
        }
        selectElement.appendChild(opt);
    }
}

const intervalLoader = setInterval(transportLoader, 5000);

function transportLoader() {
    if (!pauseTransportLoad) DisplayTransport();
}

const selectTransportFeature = (imei) => {
    let features = transportVectorSource.getFeatures();
    for (let i = 0; i < features.length; i++) {
        if (features[i].get('imei') === imei) {
            features[i].set('selected', true);
            let deselected = [];
            if (mapSelectInteraction.getFeatures().getLength() > 0)
                deselected = [mapSelectInteraction.getFeatures().item(0)];
            mapSelectInteraction.getFeatures().clear();
            mapSelectInteraction.getFeatures().push(features[i]);
            mapSelectInteraction.dispatchEvent({
                type: 'select',
                selected: [features[i]],
                deselected: deselected
            });
            PanToFeature(features[i]);
            return features[i];
        }
    }
    return null;
};

const unselectTransportFeature = (imei) => {
    let features = transportVectorSource.getFeatures();
    for (let i = 0; i < features.length; i++) {
        if (features[i].get('imei') === imei) {
            features[i].set('selected', false);
            return features[i];
        }
    }
    return null;
};
