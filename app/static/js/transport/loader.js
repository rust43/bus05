let loadedTransport = null;

async function LoadTransportList() {
    let api_endpoint = "/api/v1/transport/";
    await APIGetRequest(api_endpoint).then((transportList) => {
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