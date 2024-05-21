
let busStopsVectorSource = new olVectorSource({ wrapX: false });
let busStopsVectorLayer = new olVectorLayer({ source: busStopsVectorSource, style: setFeatureStyle });
map.addLayer(busStopsVectorLayer);

let loadedBusStops = null;

function LoadBusStops() {
    GetBusStops().then(busStops => {
        DisplayBusStops(busStops);
    });
}

async function GetBusStops() {
    const url = host + "/api/v1/busstop/";
    let response = await fetch(
        url,
        {
            method: "get",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json", "Content-Type": "application/json"
            },
        });
    if (response.ok) {
        return await response.json();
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}

function DisplayBusStops(busStops) {
    loadedBusStops = busStops;
    const busstopListContainer = document.getElementById('busstop-list');
    busstopListContainer.innerHTML = '';
    for (let i = 0; i < busStops.length; i++) {
        const busStop = busStops[i];
        let coordinates = new olPointGeometry(busStop.location.point.geom.coordinates);
        coordinates = coordinates.transform("EPSG:4326", "EPSG:3857");
        const busStopFeature = new olFeature({
            geometry: coordinates, type: busStop.location.point.geom.type, name: busStop.name,
        });
        busStopFeature.setId(busStop.location.point.id);
        busStopFeature.set("type", "busstop");
        busStopsVectorSource.addFeature(busStopFeature);

        // add button to view route
        const busstopButton = document.createElement("BUTTON");
        const busstopButtonText = document.createTextNode(busStop.name);
        busstopButton.appendChild(busstopButtonText);
        busstopButton.classList.add('btn', 'badge', 'text-bg-success');
        busstopButton.onclick = function () {
            SelectBusStopData(busStop.id);
        };
        busstopListContainer.appendChild(busstopButton);
    }
}

function DisplayPath(id, name, geomLine) {
    let coordinates = new olLineStringGeometry(geomLine.coordinates);
    coordinates = coordinates.transform("EPSG:4326", "EPSG:3857");
    const routeFeature = new olFeature({
        geometry: coordinates, type: geomLine.type, name: name,
    });
    routeFeature.setId(id);
    routeFeature.set("type", "path");
    routesVectorSource.addFeature(routeFeature);
}

LoadBusStops();
