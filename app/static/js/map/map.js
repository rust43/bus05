// ----------------------
// OpenLayers definitions
// ----------------------

// Base components
const olMap = ol.Map;
const olView = ol.View;

// Overlay components
const olOverlay = ol.Overlay;

// Source components
const olXYZSource = ol.source.XYZ;
const olVectorSource = ol.source.Vector;

// Layer components
const olVectorLayer = ol.layer.Vector;
const olTileLayer = ol.layer.Tile;

// Extent components
const olTransformExtent = ol.proj.transformExtent;
const olGetExtentCenter = ol.extent.getCenter;

// Control components
const olDefaultControls = ol.control.defaults;
const olScaleLineControl = ol.control.ScaleLine;
const olZoomSliderControl = ol.control.ZoomSlider;
const olFullScreenControl = ol.control.FullScreen;
const olRotateControl = ol.control.Rotate;

// Interaction components
const olDefaultInteractions = ol.interaction.defaults;
const olExtentInteraction = ol.interaction.Extent;
const olDragRotateInteraction = ol.interaction.DragRotate;
const olSelectInteraction = ol.interaction.Select;
const olSnapInteraction = ol.interaction.Snap;
const olDrawInteraction = ol.interaction.Draw;
const olModifyInteraction = ol.interaction.Modify;
const olTranslateInteraction = ol.interaction.Translate;

// Proj components
const olTransform = ol.proj.transform;
const olFromLonLat = ol.proj.fromLonLat;

// Styling components
const olStyle = ol.style.Style;
const olIconStyle = ol.style.Icon;
const olFillStyle = ol.style.Fill;
const olCircleStyle = ol.style.Circle;
const olStrokeStyle = ol.style.Stroke;
const olSize = ol.size;

// Geometry components
const olPointGeometry = ol.geom.Point;
const olCircleGeometry = ol.geom.Circle;
const olPolygonGeometry = ol.geom.Polygon;
const olLineStringGeometry = ol.geom.LineString;

// Sphere components
const olSphere = ol.Sphere;
const olGetArea = ol.sphere.getArea;
const olGetLength = ol.sphere.getLength;
const olGetDistance = ol.sphere.getDistance;

// Feature components
const olFeature = ol.Feature;

// Condition components
const olShiftKeyOnly = ol.events.condition.shiftKeyOnly;
const olUnByKey = ol.Observable;

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

tileLayer = layer2gis;

// ----------------------
// Map control definition
// ----------------------

const scaleControl = new olScaleLineControl({ units: "metric" });
const zoomSliderControl = new olZoomSliderControl();
const fullScreenControl = new olFullScreenControl();
const rotateControl = new olRotateControl();
const controls = [scaleControl, rotateControl, fullScreenControl];

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
        maxZoom: 18,
        extent: mapExtent,
    });
}

// ------------------
// Map clean function
// ------------------

function CleanVectorLayer(vectorSource) {
    if (confirm('Вы действительно хотите удалить все объекты с карты?')) {
        vectorSource.clear();
    }
    return true;
}

// --------------------------
// Map feature save functions
// --------------------------

function submitMap(vectorSource) {
    let geoJSONStr = ConvertToGeoJSON(vectorSource);
    let geoJSONData = document.getElementById("geoJSONData");
    geoJSONData.value = geoJSONStr;
}

function ConvertToGeoJSON(vectorSource) {
    let features = [];
    vectorSource.getFeatures().forEach(function (feature) {
        const geometry_type = feature.getGeometry().getType();
        if (geometry_type === 'Circle') {
            const center = feature.getGeometry().getCenter();
            const radius = feature.getGeometry().getRadius();
            const new_circle_feature = new Feature({
                geometry: new olPointGeometry(center),
                radius: radius,
                type: 'Circle',
                name: feature.get('name'),
                height: feature.get('height'),
                speed: feature.get('speed'),
                fillColor: feature.get('fillColor'),
                strokeColor: feature.get('strokeColor'),
                strokeWidth: feature.get('strokeWidth'),
            });
            features.push(new_circle_feature);
        } else {
            feature.set('type', geometry_type);
            features.push(feature);
        }
    });
    let geoJSONFormat = new ol.format.GeoJSON();
    return geoJSONFormat.writeFeatures(features, {
        dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'
    });
}

function SetTileLayer(layerName) {
    map.removeLayer(tileLayer);
    if (layerName === "osm") {
        tileLayer = layerOSM;
    } else if (layerName === "2gis") {
        tileLayer = layer2gis;
    }
    map.getLayers().insertAt(0, tileLayer)
}