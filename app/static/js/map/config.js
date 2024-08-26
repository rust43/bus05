// ----------------------
// Map configuration
// ----------------------

ol.proj.proj4.register(proj4);

const host = "http://" + window.location.hostname + ':' + window.location.port;
const staticURL = host + '/static';

const defaultExtent = [47.384, 42.8972, 47.6176, 43.059];

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
    'title': 'yandex',
    source: new olXYZSource({
        url: host + '/tiles/yandex/{z}/{x}/{y}.png',
        tilePixelRatio: 2,
    }),
});

tileLayer = layerOSM;

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
const mouseWheelZoomInteraction = new olMouseWheelZoomInteraction({
    // timeout: 250,
    // duration: 250,
});
const interactions = [dragRotateInteraction, mouseWheelZoomInteraction];

// --------------
// Map definition
// --------------

let map = new olMap({
    controls: olDefaultControls.defaults({ attribution: false }).extend(controls),
    interactions: olDefaultInteractions.defaults().extend(interactions),
    target: 'map',
    layers: [tileLayer],
    view: GetExtentView(defaultExtent),
    pixelRatio: 2,
    hidpi: false,
});

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
        // resolutions: tileLayer.getSource().getTileGrid().getResolutions(),
        // constrainResolution: true,
        zoom: 10,
        minZoom: 2,
        maxZoom: 18,
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
    } else if (layerName === "yandex") {
        tileLayer = layerYandex;
    }
    map.getLayers().insertAt(0, tileLayer)
}
