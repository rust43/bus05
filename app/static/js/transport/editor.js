const selectedTransportNameInput = document.getElementById('selected-transport-name');
const selectedTransportPlateInput = document.getElementById('selected-transport-plate');
const selectedTransportIDInput = document.getElementById('selected-transport-id');
const selectedTransportIMEISelect = document.getElementById('selected-transport-imei-select');
const selectedTransportRouteSelect = document.getElementById('selected-transport-route-select');
const selectedTransportTypeSelect = document.getElementById('selected-transport-type-select');
const selectedTransportTypeInput = document.getElementById('selected-transport-type');
const selectedTransportTypeChk = document.getElementById('selected-transport-type-chk');
const selectedTransportActiveChk = document.getElementById('selected-transport-active-chk');
const selectedTransportTypeInputField = document.getElementById('selected-transport-type-field');

function ClearEditTransportForm() {
    inputClearHelper(selectedTransportNameInput);
    inputClearHelper(selectedTransportPlateInput);
    inputClearHelper(selectedTransportTypeInput);
    selectedTransportTypeInputField.classList.add("d-none");
    selectedTransportTypeChk.checked = false;
    selectedTransportActiveChk.checked = false;
    selectedTransportTypeSelect.disabled = false;
    selectClearHelper(selectedTransportIMEISelect);
    selectClearHelper(selectedTransportRouteSelect);
    selectClearHelper(selectedTransportTypeSelect);
}

function SelectTransportData(transportId) {
    if (transportId === '') return;
    ClearEditTransportForm();
    let editedTransport = GetSelectedTransport(transportId);
    document.getElementById('transport-selected').classList.remove('d-none');
    selectedTransportNameInput.value = editedTransport.name;
    selectedTransportIDInput.value = editedTransport.id;
    selectedTransportPlateInput.value = editedTransport.license_plate;
    selectedTransportActiveChk.checked = editedTransport.active;
    FillTransportRouteSelect(selectedTransportRouteSelect).then(() => {
        selectedTransportRouteSelect.value = editedTransport.route;
    });
    FillTransportTypeSelect(selectedTransportTypeSelect).then(() => {
        selectedTransportTypeSelect.value = editedTransport.transport_type;
    });
    FillTransportIMEISelect(selectedTransportIMEISelect).then(() => {
        let opt = document.createElement('option');
        opt.value = editedTransport.imei;
        opt.innerHTML = editedTransport.imei;
        selectedTransportIMEISelect.appendChild(opt);
        selectedTransportIMEISelect.value = editedTransport.imei;
    });
}

function GetSelectedTransport(transportId) {
    for (let i = 0; i < loadedTransport.length; i++) {
        if (loadedTransport[i].id === transportId) return loadedTransport[i];
    }
    return null;
}

TransportTypeChkListener(selectedTransportTypeChk, selectedTransportTypeInputField, selectedTransportTypeInput, selectedTransportTypeSelect);

function TransportEditFormValidation() {
    let result = true;
    result *= inputValidationHelper(selectedTransportNameInput);
    result *= inputValidationHelper(selectedTransportPlateInput);
    if (selectedTransportTypeChk.checked) {
        result *= inputValidationHelper(selectedTransportTypeInput);
        selectClearHelper(selectedTransportTypeSelect);
    } else {
        result *= selectValidationHelper(selectedTransportTypeSelect);
        inputClearHelper(selectedTransportTypeInput);
    }
    result *= selectValidationHelper(selectedTransportRouteSelect);
    result *= selectValidationHelper(selectedTransportIMEISelect);
    return result;
}

function EditTransport() {
    if (!TransportEditFormValidation()) {
        alert('Проверьте данные редактируемого транспорта!');
        return;
    }
    let transport_id = selectedTransportIDInput.value;
    let transport_type;
    let new_transport_type = false;
    if (selectedTransportTypeChk.checked) {
        transport_type = selectedTransportTypeInput.value;
        new_transport_type = true;
    } else {
        transport_type = selectedTransportTypeSelect.value;
    }
    const transport_data = {
        'transport_id': transport_id,
        'imei': selectedTransportIMEISelect.value,
        'name': selectedTransportNameInput.value,
        'license_plate': selectedTransportPlateInput.value,
        'active': selectedTransportActiveChk.checked,
        'transport_type': transport_type,
        'new_transport_type': new_transport_type,
        'route': selectedTransportRouteSelect.value,
    };
    PutTransport(transport_data).then(function () {
        alert('Транспорт сохранен!');
        try {
            LoadTransportList().then(() => {
                SelectTransportData(transport_id);
            });
        } catch (err) {
            alert('Ошибка при сохранении нового транспорта!');
        }
    });
}

async function PutTransport(transport_data) {
    const url = host + '/api/v1/transport/';
    const response = await fetch(url, {
        method: 'put', credentials: 'same-origin', headers: {
            'X-CSRFToken': getCookie('csrftoken'), 'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(transport_data)
    });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

async function DeleteTransport() {
    let transportId = selectedTransportIDInput.value;
    const transport_data = {
        'transport_id': transportId
    };
    await DeleteTransportRequest(transport_data).then(function () {
        alert('Транспорт удален!');
        try {
            document.getElementById('transport-selected').classList.add('d-none');
            LoadTransportList();
        } catch (err) {
            alert('Ошибка при удалении нового транспорта!');
        }
    });
}

async function DeleteTransportRequest(transport_data) {
    const url = host + '/api/v1/transport/';
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
            body: JSON.stringify(transport_data)
        });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}