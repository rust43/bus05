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
    await LoadTransport();
    const transportListContainer = document.getElementById('transport-list');
    if (transportListContainer) transportListContainer.innerHTML = '';
    for (let i = 0; i < loadedTransport.length; i++) {
        const transport = loadedTransport[i];
        // add button to view transport
        const transportButton = document.createElement('button');
        const transportButtonText = document.createTextNode(transport.name);
        if (transportListContainer) {
            transportButton.appendChild(transportButtonText);
            if (transport.active)
                transportButton.classList.add('btn', 'badge', 'text-bg-warning');
            else
                transportButton.classList.add('btn', 'badge', 'text-bg-secondary');
            transportButton.onclick = function () { SelectTransportData(transport.id); };
            transportListContainer.appendChild(transportButton);
        }
    }
}

async function LoadTransportPoints() {
    if (loadedTransport.length === 0) return;
    let imeiList = [];
    for (let i = 0; i < loadedTransport.length; i++) {
        if (!loadedTransport[i].active) continue;
        imeiList.push(loadedTransport[i].imei);
    }
    const data = { 'imei': imeiList };
    return await APIPostRequest(data, transportAPI.point);
}

async function DisplayTransport() {
    let pointList = await LoadTransportPoints();
    if (!pointList) return;
    let features = [];
    for (let i = 0; i < pointList.length; i++) {
        const point = pointList[i];
        let coordinates = olFromLonLat([point["lon"], point["lat"]]);
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
        else
            transportFeature.set('selected', false);
        transportFeature.set('type', 'transport');
        transportFeature.set('transport_type', transport.transport_type);
        transportFeature.set('course', point["course"]);
        transportFeature.set('speed', point.speed);
        transportFeature.set('height', point.height);
        transportFeature.set('sats', point["sats"]);
        transportFeature.set('route', transport.route);
        features.push(transportFeature);
    }
    transportVectorSource.clear();
    transportVectorSource.addFeatures(features);
}

// helper functions

function SelectTransportFeature(imei) {
    let features = transportVectorSource.getFeatures();
    for (let i = 0; i < features.length; i++) {
        if (features[i].get('imei') === imei)
            features[i].set('selected', true);
    }
}

function UnselectTransportFeature(imei) {
    let features = transportVectorSource.getFeatures();
    for (let i = 0; i < features.length; i++) {
        if (features[i].get('imei') === imei)
            features[i].set('selected', false);
    }
}

function GetTransport(imei) {
    if (loadedTransport.length === 0) return;
    for (let i = 0; i < loadedTransport.length; i++) {
        if (loadedTransport[i].imei === imei) return loadedTransport[i];
    }
    return null;
}

function FillSelect(selectElement, valueList, valueNames = null) {
    selectElement.selectedIndex = 0;
    let i, l = selectElement.options.length - 1;
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
    if (!pauseTransportLoad)
        DisplayTransport();
}
