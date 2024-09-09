// Create interactions for new transport

// interface elements dict

const newTransInterface = {
    nameInput: document.getElementById('new-transport-name'),
    plateInput: document.getElementById('new-transport-plate'),
    typeInput: document.getElementById('new-transport-type'),
    imeiSelect: document.getElementById('new-transport-imei'),
    routeSelect: document.getElementById('new-transport-route'),
    typeSelect: document.getElementById('new-transport-type-select'),
    typeInputField: document.getElementById('new-transport-type-input'),
    typeChk: document.getElementById('new-transport-type-chk'),
    activeChk: document.getElementById('new-transport-active-chk')
};

function ClearNewTransportForm() {
    inputClearHelper(newTransInterface.nameInput);
    inputClearHelper(newTransInterface.plateInput);
    inputClearHelper(newTransInterface.typeInput);
    newTransInterface.typeInputField.classList.add('d-none');
    newTransInterface.typeChk.checked = false;
    newTransInterface.activeChk.checked = false;
    newTransInterface.typeSelect.disabled = false;
    selectClearHelper(newTransInterface.imeiSelect);
    selectClearHelper(newTransInterface.routeSelect);
    selectClearHelper(newTransInterface.typeSelect);
}

async function FillNewTransportForm() {
    ClearNewTransportForm();
    await FillTransportIMEISelect(newTransInterface.imeiSelect);
    await FillTransportRouteSelect(newTransInterface.routeSelect);
    await FillTransportTypeSelect(newTransInterface.typeSelect);
}

async function FillTransportIMEISelect(selectElement) {
    await APIGetRequest(transportAPI.imei).then((IMEIList) => {
        FillSelect(selectElement, IMEIList);
    });
}

async function FillTransportRouteSelect(selectElement) {
    await APIGetRequest(routeAPI.main).then((RouteList) => {
        FillSelect(selectElement, RouteList, ['id', 'name']);
    });
}

async function FillTransportTypeSelect(selectElement) {
    await APIGetRequest(transportAPI.type).then((TypesList) => {
        FillSelect(selectElement, TypesList, ['id', 'name']);
    });
}

function TransportCreateFormValidation() {
    let result = true;
    result *= inputValidationHelper(newTransInterface.nameInput);
    result *= inputValidationHelper(newTransInterface.plateInput);
    if (newTransInterface.typeChk.checked) {
        result *= inputValidationHelper(newTransInterface.typeInput);
        selectClearHelper(newTransInterface.typeSelect);
    } else {
        result *= selectValidationHelper(newTransInterface.typeSelect);
        inputClearHelper(newTransInterface.typeInput);
    }
    result *= selectValidationHelper(newTransInterface.routeSelect);
    result *= selectValidationHelper(newTransInterface.imeiSelect);
    return result;
}

const inputValidationHelper = function (input) {
    if (input && input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        return false;
    }
};

const selectValidationHelper = function (select) {
    if (select.selectedIndex > 0) {
        select.classList.remove('is-invalid');
        select.classList.add('is-valid');
        return true;
    } else {
        select.classList.remove('is-valid');
        select.classList.add('is-invalid');
        return false;
    }
};

async function SaveNewTransport() {
    if (!TransportCreateFormValidation()) {
        alert('Проверьте данные нового транспорта!');
        return;
    }
    let transport_type;
    let new_transport_type = false;
    if (newTransInterface.typeChk.checked) {
        transport_type = newTransInterface.typeInput.value;
        new_transport_type = true;
    } else {
        transport_type = newTransInterface.typeSelect.value;
    }
    const transport_data = {
        imei: newTransInterface.imeiSelect.value,
        name: newTransInterface.nameInput.value,
        license_plate: newTransInterface.plateInput.value,
        active: newTransInterface.activeChk.checked,
        transport_type: transport_type,
        new_transport_type: new_transport_type,
        route: newTransInterface.routeSelect.value
    };
    APIPostRequest(transport_data, transportAPI.main).then(function () {
        try {
            FillNewTransportForm();
            LoadTransport().then(function () {
                DisplayTransport();
                alert('Транспорт сохранен!');
            });
        } catch (err) {
            alert('Ошибка при сохранении нового транспорта!');
        }
    });
}

function TransportTypeChkListener(chkEl, inputParent, inputEl, selectEl) {
    chkEl.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            inputParent.classList.remove('d-none');
            inputEl.disabled = false;
            selectEl.disabled = true;
        } else {
            inputParent.classList.add('d-none');
            inputEl.disabled = true;
            selectEl.disabled = false;
        }
    });
}

TransportTypeChkListener(
    newTransInterface.typeChk,
    newTransInterface.typeInputField,
    newTransInterface.typeInput,
    newTransInterface.typeSelect
);
