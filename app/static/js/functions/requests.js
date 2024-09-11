// api endpoints definition

const routeAPI = {
  main: '/api/v1/route',
  type: '/api/v1/route/type'
};

const transportAPI = {
  main: '/api/v1/transport',
  imei: '/api/v1/transport/imei',
  type: '/api/v1/transport/type',
  point: '/api/v1/transport/point'
};

const busstopAPI = {
  main: '/api/v1/busstop'
};

const dataAPI = {
  main: '/api/v1/data'
};

const APIGetRequest = async function (APIAddress) {
  const url = host + APIAddress;
  let response = await fetch(url, {
    method: 'get',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    return await response.json();
  } else {
    console.log('Ошибка HTTP: ' + response.status);
  }
};

const APIPostRequest = async function (data, APIAddress) {
  let cookie = null;
  if (typeof getCookie === 'function') cookie = getCookie('csrftoken');
  const response = await fetch(APIAddress, {
    method: 'post',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': cookie,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
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
};

const APIPutRequest = async function (data, APIAddress) {
  const response = await fetch(APIAddress, {
    method: 'put',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    return true;
  } else {
    console.log('Ошибка HTTP: ' + response.status);
  }
};

const APIDeleteRequest = async function (data, APIAddress) {
  const response = await fetch(APIAddress, {
    method: 'delete',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    return true;
  } else {
    console.log('Ошибка HTTP: ' + response.status);
  }
};
