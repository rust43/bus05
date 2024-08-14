const transportNameInput = document.getElementById("new-transport-name");
const transportPlateInput = document.getElementById("new-transport-plate");
const transportIMEISelect = document.getElementById('new-transport-imei');
const transportRouteSelect = document.getElementById('new-transport-route');
const transportTypeSelect = document.getElementById('new-transport-type-select');
const transportTypeInput = document.getElementById("new-transport-type");
const transportTypeChk = document.getElementById("new-transport-type-chk");
const transportActiveChk = document.getElementById("new-transport-active-chk");
const transportTypeInputField = document.getElementById("new-transport-type-input");

function ClearNewTransportForm() {
    inputClearHelper(transportNameInput);
    inputClearHelper(transportPlateInput);
    inputClearHelper(transportTypeInput);
    transportTypeInputField.classList.add("d-none");
    transportTypeChk.checked = false;
    transportActiveChk.checked = false;
    transportTypeSelect.disabled = false;
    selectClearHelper(transportIMEISelect);
    selectClearHelper(transportRouteSelect);
    selectClearHelper(transportTypeSelect);
}

const inputClearHelper = function (input) {
    input.value = "";
    input.classList.remove("is-valid");
    input.classList.remove("is-invalid");
}

const selectClearHelper = function (select) {
    select.selectedIndex = 0;
    select.classList.remove("is-valid");
    select.classList.remove("is-invalid");
}

function FillNewTransportForm() {
    ClearNewTransportForm();
    FillTransportIMEISelect();
    FillTransportRouteSelect();
    FillTransportTypeSelect();
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
        }
        else {
            opt.value = valueList[i];
            opt.innerHTML = valueList[i];
        }
        selectElement.appendChild(opt);
    }
}

function FillTransportIMEISelect() {
    let api_endpoint = "/api/v1/transport-imei/";
    APIGetRequest(api_endpoint).then((IMEIList) => {
        FillSelect(transportIMEISelect, IMEIList);
    });
}

function FillTransportRouteSelect() {
    APIGetRequest("/api/v1/route/").then((RouteList) => {
        FillSelect(transportRouteSelect, RouteList, ["id", "name"]);
    });
}

function FillTransportTypeSelect() {
    APIGetRequest("/api/v1/transport-type/").then((TypesList) => {
        FillSelect(transportTypeSelect, TypesList, ["id", "name"]);
    });
}

function TransportFormValidation() {
    let result = true;
    result *= inputValidationHelper(transportNameInput);
    result *= inputValidationHelper(transportPlateInput);
    if (transportTypeChk.checked) {
        result *= inputValidationHelper(transportTypeInput);
        selectClearHelper(transportTypeSelect);
    }
    else {
        result *= selectValidationHelper(transportTypeSelect);
        inputClearHelper(transportTypeInput);
    }
    result *= selectValidationHelper(transportRouteSelect);
    result *= selectValidationHelper(transportIMEISelect);
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
}

const selectValidationHelper = function (select) {
    if (select.selectedIndex !== 0) {
        select.classList.remove('is-invalid');
        select.classList.add('is-valid');
        return true;
    }
    else {
        select.classList.remove('is-valid');
        select.classList.add('is-invalid');
        return false;
    }
}

function SaveNewTransport() {
    if (!TransportFormValidation()) {
        alert('Проверьте данные нового транспорта!');
        return;
    }

    let transport_type = null;
    let new_transport_type = false;
    if (transportTypeChk.checked) {
        transport_type = transportTypeInput.value;
        new_transport_type = true;
    }
    else {
        transport_type = transportTypeSelect.value;
    }

    const transport_data = {
        'imei': transportIMEISelect.value,
        'name': transportNameInput.value,
        'license_plate': transportPlateInput.value,
        'active': transportActiveChk.checked,
        'transport_type': transport_type,
        'new_transport_type': new_transport_type,
        'route': transportRouteSelect.value,
    };
    PostNewTransport(transport_data).then(function () {
        alert('Транспорт сохранен!');
        try {
            FillNewTransportForm();
        } catch (err) {
            alert('Ошибка при сохранении нового транспорта!');
        }
    });
}

async function PostNewTransport(transport_data) {
    const url = host + '/api/v1/transport/';
    const response = await fetch(
        url,
        {
            method: 'post',
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

transportTypeChk.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        transportTypeInputField.classList.remove("d-none");
        transportTypeInput.disabled = false;
        transportTypeSelect.disabled = true;
    }
    else {
        transportTypeInputField.classList.add("d-none");
        transportTypeInput.disabled = true;
        transportTypeSelect.disabled = false;
    }
});

