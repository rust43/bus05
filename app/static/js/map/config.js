// ----------------------
// Map configuration
// ----------------------

proj4.defs('EPSG:3395', '+proj=merc +datum=WGS84 +ellps=WGS84 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +no_defs');

ol.proj.proj4.register(proj4);

ol.proj.get('EPSG:3395').setExtent(
    [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]
);

const host = "http://" + window.location.hostname + ':' + window.location.port;
const staticURL = host + '/static';

// const defaultExtent = [47.384, 42.8972, 47.6176, 43.059];

// const defaultExtent = [47.1986, 42.7714, 47.7203, 43.1195];

const defaultExtent = [47.0252, 42.7505, 47.7292, 43.3064];

// -----------------
// Layers definition
// -----------------

let tileLayer;

let layerOSM = new olTileLayer({
    'title': 'osm', source: new olXYZSource({ url: host + '/tiles/osm/{z}/{x}/{y}.png' }),
});

let layer2gis = new olTileLayer({
    'title': '2gis', source: new olXYZSource({ url: host + '/tiles/2gis/{z}/{x}/{y}.png' }),
});

let layerYandex = new olTileLayer({
    'title': 'yandex', source: new olXYZSource({ url: host + '/tiles/yandex/{z}/{x}/{y}.png' }),
});

let onlineLayerYandex = new olTileLayer({
    'title': 'onlineyandex',
    source: new olXYZSource({
        url: "https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&lang=ru_RU",
        projection: 'EPSG:3395',
        tileGrid: ol.tilegrid.createXYZ({
            extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
        }),
    }),
});

tileLayer = onlineLayerYandex;

// ----------------------
// Map control definition
// ----------------------

const scaleControl = new olScaleLineControl({ units: "metric" });
const zoomSliderControl = new olZoomSliderControl();
const fullScreenControl = new olFullScreenControl();
const rotateControl = new olRotateControl();
const controls = [scaleControl, rotateControl, zoomSliderControl, fullScreenControl];

// --------------------------
// Map interaction definition
// --------------------------

const dragRotateInteraction = new olDragRotateInteraction();
const interactions = [dragRotateInteraction];

// --------------
// Map definition
// --------------

let map = new olMap({
    controls: olDefaultControls.defaults({ attribution: false }).extend(controls),
    interactions: olDefaultInteractions.defaults().extend(interactions),
    target: 'map',
    layers: [tileLayer],
    view: GetExtentView(defaultExtent),
});

map.addInteraction(new ol.interaction.MouseWheelZoom({
    duration: 250,
    timeout: 100,
}));

// ------------------
// Map set extent function
// ------------------

function SetExtent(webExtent) {
    webExtent = [webExtent[0][0], webExtent[0][1], webExtent[1][0], webExtent[1][1]];
    map.setView(GetExtentView(webExtent));
}

function GetExtentView(webExtent) {
    const mapExtent = ol.proj.transformExtent(webExtent, 'EPSG:4326', 'EPSG:3857');
    const viewCenter = olGetExtentCenter(mapExtent);
    return new olView({
        center: viewCenter,
        constrainResolution: true,
        zoom: 10,
        minZoom: 2,
        maxZoom: 21,
        extent: mapExtent,
    });
}

// ------------------
// Map set tile layer function
// ------------------

function SetTileLayer(layerName) {
    map.removeLayer(tileLayer);
    if (layerName === "osm") {
        tileLayer = layerOSM;
    } else if (layerName === "2gis") {
        tileLayer = layer2gis;
    }
    else if (layerName === "yandex") {
        tileLayer = layerYandex;
    }
    map.getLayers().insertAt(0, tileLayer)
}