// Edit interactions for transport

// interface elements dict

const editTransInterface = {
    id: document.getElementById('selected-transport-id'),
    type: document.getElementById('selected-transport-type'),
    name: document.getElementById('selected-transport-name'),
    plate: document.getElementById('selected-transport-plate'),
    typeChk: document.getElementById('selected-transport-type-chk'),
    imei: document.getElementById('selected-transport-imei-select'),
    route: document.getElementById('selected-transport-route-select'),
    typeSel: document.getElementById('selected-transport-type-select'),
    typeField: document.getElementById('selected-transport-type-field'),
    activeChk: document.getElementById('selected-transport-active-chk')
};

function ClearEditTransportForm() {
    inputClearHelper(editTransInterface.name);
    inputClearHelper(editTransInterface.plate);
    inputClearHelper(editTransInterface.type);
    editTransInterface.typeField.classList.add('d-none');
    editTransInterface.typeChk.checked = false;
    editTransInterface.activeChk.checked = false;
    editTransInterface.typeSel.disabled = false;
    selectClearHelper(editTransInterface.imei);
    selectClearHelper(editTransInterface.route);
    selectClearHelper(editTransInterface.typeSel);
}

function SelectTransportData(transportId) {
    if (transportId === '') return;
    ClearEditTransportForm();
    let editedTransport = GetSelectedTransport(transportId);
    document.getElementById('transport-data').classList.remove('d-none');
    editTransInterface.name.value = editedTransport.name;
    editTransInterface.id.value = editedTransport.id;
    editTransInterface.plate.value = editedTransport.license_plate;
    editTransInterface.activeChk.checked = editedTransport.active;
    FillTransportRouteSelect(editTransInterface.route).then(() => {
        editTransInterface.route.value = editedTransport.route;
    });
    FillTransportTypeSelect(editTransInterface.typeSel).then(() => {
        editTransInterface.typeSel.value = editedTransport.transport_type;
    });
    FillTransportIMEISelect(editTransInterface.imei).then(() => {
        let opt = document.createElement('option');
        opt.value = editedTransport.imei;
        opt.innerHTML = editedTransport.imei;
        editTransInterface.imei.appendChild(opt);
        editTransInterface.imei.value = editedTransport.imei;
    });
    document.getElementById('show-transport-location-button').onclick = function () {
        SelectTransportFeature(editedTransport.imei);
    };
}

function GetSelectedTransport(transportId) {
    for (let i = 0; i < loadedTransport.length; i++) {
        if (loadedTransport[i].id === transportId) return loadedTransport[i];
    }
    return null;
}

TransportTypeChkListener(
    editTransInterface.typeChk,
    editTransInterface.typeField,
    editTransInterface.type,
    editTransInterface.typeSel
);

function TransportEditFormValidation() {
    let result = true;
    result *= inputValidationHelper(editTransInterface.name);
    result *= inputValidationHelper(editTransInterface.plate);
    if (editTransInterface.typeChk.checked) {
        result *= inputValidationHelper(editTransInterface.type);
        selectClearHelper(editTransInterface.typeSel);
    } else {
        result *= selectValidationHelper(editTransInterface.typeSel);
        inputClearHelper(editTransInterface.type);
    }
    result *= selectValidationHelper(editTransInterface.route);
    result *= selectValidationHelper(editTransInterface.imei);
    return result;
}

function EditTransport() {
    if (!TransportEditFormValidation()) {
        alert('Проверьте данные редактируемого транспорта!');
        return;
    }
    let transport_id = editTransInterface.id.value;
    let transport_type;
    let new_transport_type = false;
    if (editTransInterface.typeChk.checked) {
        transport_type = editTransInterface.type.value;
        new_transport_type = true;
    } else {
        transport_type = editTransInterface.typeSel.value;
    }
    const transport_data = {
        transport_id: transport_id,
        imei: editTransInterface.imei.value,
        name: editTransInterface.name.value,
        license_plate: editTransInterface.plate.value,
        active: editTransInterface.activeChk.checked,
        transport_type: transport_type,
        new_transport_type: new_transport_type,
        route: editTransInterface.route.value
    };
    APIPutRequest(transport_data, transportAPI.main).then(function () {
        try {
            document.getElementById('transport-data').classList.add('d-none');
            FillTransportList().then(() => {
                DisplayTransport();
                alert('Транспорт сохранен!');
            });
        } catch (err) {
            alert('Ошибка при сохранении нового транспорта!');
        }
    });
}

async function DeleteTransport() {
    let transportId = editTransInterface.id.value;
    const transport_data = { transport_id: transportId };
    await APIDeleteRequest(transport_data, transportAPI.main).then(function () {
        try {
            document.getElementById('transport-data').classList.add('d-none');
            alert('Транспорт удален!');
            FillTransportList().then(() => {
                DisplayTransport();
            });
        } catch (err) {
            alert('Ошибка при удалении нового транспорта!');
        }
    });
}
