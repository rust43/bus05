//
// Transport layer loader file
//

// openlayers layers definition
const transportVectorSource = new olVectorSource({wrapX: false});
const transportVectorLayer = new olVectorLayer({source: transportVectorSource, style: mapStyleFunction});

// openlayers adding transport layer
map.addLayer(transportVectorLayer);

// var to keep loaded transport list
let loadedTransport = null;

async function LoadTransport() {
    loadedTransport = await APIGetRequest(transportAPI.main);
}

LoadTransport().then(function () {
    console.log("Транспорт загружен");
});

async function FillTransportList() {
    await LoadTransport();
    const transportListContainer = document.getElementById('transport-list');
    if (transportListContainer) transportListContainer.innerHTML = '';
    for (let i = 0; i < loadedTransport.length; i++) {
        const transport = loadedTransport[i];
        // add button to view transport
        const transportButton = document.createElement('button');
        const transportButtonText = document.createTextNode(transport.name + " " + transport.license_plate);
        if (transportListContainer) {
            transportButton.appendChild(transportButtonText);
            transportButton.classList.add('btn', 'badge', 'text-bg-warning');
            transportButton.onclick = function () {
                SelectTransportData(transport.id);
            };
            transportListContainer.appendChild(transportButton);
        }
    }
}

async function LoadTransportPoints() {
    if (loadedTransport.length === 0) return;
    let imeiList = [];
    for (let i = 0; i < loadedTransport.length; i++) {
        imeiList.push(loadedTransport[i].imei);
    }
    const data = {'imei': imeiList};
    return await APIPostRequest(data, transportAPI.point);
}

async function DisplayTransport() {
    transportVectorSource.clear();
    let pointList = await LoadTransportPoints();
    for (let i = 0; i < pointList.length; i++) {
        const point = pointList[i];
        let coordinates = olFromLonLat([point["lon"], point["lat"]]);
        coordinates = new olPointGeometry(coordinates);
        // coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
        const transportFeature = new olFeature({geometry: coordinates});
        const transport = GetTransport(point.imei);
        if (transport === null) return;
        transportFeature.setId(transport.id);
        transportFeature.set('name', 'transport-' + transport.id);
        transportFeature.set('type', 'transport');
        transportFeature.set('transport_type', transport.transport_type);
        transportFeature.set('course', point["course"]);
        transportFeature.set('speed', point.speed);
        transportFeature.set('height', point.height);
        transportFeature.set('sats', point["sats"]);
        transportFeature.set('route', transport.route);
        transportVectorSource.addFeature(transportFeature);
    }
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