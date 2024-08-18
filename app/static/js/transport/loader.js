//
// Transport layer loader file
//

let transport_api_endpoint = "/api/v1/transport/";
let transportVectorSource = new olVectorSource({ wrapX: false });
let transportVectorLayer = new olVectorLayer({ source: transportVectorSource, style: mapStyleFunction });
map.addLayer(transportVectorLayer);

let loadedTransport = null;

async function LoadTransport() {
    loadedTransport = await APIGetRequest(transport_api_endpoint);
    transportVectorSource.clear();
    DisplayTransport(loadedTransport);
}

async function LoadTransportList() {
    await APIGetRequest(transport_api_endpoint).then((transportList) => {
        loadedTransport = transportList;
        const transportListContainer = document.getElementById('transport-list');
        if (transportListContainer) transportListContainer.innerHTML = '';
        for (let i = 0; i < transportList.length; i++) {
            const transport = transportList[i];
            // add button to view transport
            const transportButton = document.createElement('BUTTON');
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
    });
}

async function LoadTransportPoints() {
    let transport_points_api_endpoint = "/api/v1/transport/point/";
    let imeiList = [];
    for (let i = 0; i < loadedTransport.length; i++) {
        imeiList.push(loadedTransport[i].imei);
    }
    const data = { 'imei': imeiList };
    await APIPostRequest(data, transport_points_api_endpoint).then((pointList) => {
        console.log(pointList);
    });
}

async function APIGetRequest(address) {
    const url = host + address;
    let response = await fetch(url, {
        method: 'get', credentials: 'same-origin', headers: {
            'Accept': 'application/json', 'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        return await response.json();
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

async function APIPostRequest(data, APIAddress) {
    const response = await fetch(APIAddress, {
        method: 'post', credentials: 'same-origin', headers: {
            'X-CSRFToken': getCookie('csrftoken'), 'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    });
    if (response.ok) {
        return await response.json();
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
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

function DisplayTransport(transportList) {
    for (let i = 0; i < transportList.length; i++) {
        const transport = transportList[i];
        continue;
        let coordinates = new olPointGeometry(transport.location.point.geom.coordinates);
        coordinates = coordinates.transform('EPSG:4326', 'EPSG:3857');
        const transportFeature = new olFeature({
            geometry: coordinates, type: transport.location.point.geom.type, name: 'transport-' + transport.id
        });
        transportFeature.setId(transport.location.point.id);
        transportFeature.set('type', 'transport');
        transportFeature.set('map_object_id', transport.id);
        transportFeature.set('transport_name', transport.name);
        transportVectorSource.addFeature(transportFeature);
    }
}

LoadTransport();