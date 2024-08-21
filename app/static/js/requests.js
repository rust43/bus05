// api endpoints definition

const routeAPI = {
    "main": "/api/v1/route/"
}

const transportAPI = {
    "main": "/api/v1/transport/",
    "imei": "/api/v1/transport/imei/",
    "type": "/api/v1/transport/type/",
    "point": "/api/v1/transport/point/"
}

async function APIGetRequest(APIAddress) {
    const url = host + APIAddress;
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
        try {
            return await response.json();
        } catch {
            return true;
        }
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

async function APIPutRequest(data, APIAddress) {
    const response = await fetch(APIAddress, {
        method: 'put', credentials: 'same-origin', headers: {
            'X-CSRFToken': getCookie('csrftoken'), 'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}

async function APIDeleteRequest(data, APIAddress) {
    const response = await fetch(APIAddress, {
        method: 'delete', credentials: 'same-origin', headers: {
            'X-CSRFToken': getCookie('csrftoken'), 'Accept': 'application/json', 'Content-Type': 'application/json'
        }, body: JSON.stringify(data)
    });
    if (response.ok) {
        return true;
    } else {
        console.log('Ошибка HTTP: ' + response.status);
    }
}