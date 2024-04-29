// ----------------------
// OpenLayers definitions
// ----------------------

// Base components
const olMap = ol.Map;
const olView = ol.View;

// Overlay components
const Overlay = ol.Overlay;

// Source components
const XYZSource = ol.source.XYZ;
const VectorSource = ol.source.Vector;

// Layer components
const VectorLayer = ol.layer.Vector;
const TileLayer = ol.layer.Tile;

// Extent components
const transformExtent = ol.proj.transformExtent;
const getExtentCenter = ol.extent.getCenter;

// Control components
const defaultControls = ol.control.defaults;
const ScaleLineControl = ol.control.ScaleLine;
const ZoomSliderControl = ol.control.ZoomSlider;
const FullScreenControl = ol.control.FullScreen;
const RotateControl = ol.control.Rotate;

// Interaction components
const defaultInteractions = ol.interaction.defaults;
const ExtentInteraction = ol.interaction.Extent;
const DragRotateInteraction = ol.interaction.DragRotate;
const SelectInteraction = ol.interaction.Select;
const DrawInteraction = ol.interaction.Draw;
const ModifyInteraction = ol.interaction.Modify;
const TranslateInteraction = ol.interaction.Translate;

// Proj components
const transform = ol.proj.transform;
const fromLonLat = ol.proj.fromLonLat;

// Styling components
const Style = ol.style.Style;
const IconStyle = ol.style.Icon;
const FillStyle = ol.style.Fill;
const CircleStyle = ol.style.Circle;
const StrokeStyle = ol.style.Stroke;
const olSize = ol.size;

// Geometry components
const PointGeometry = ol.geom.Point;
const CircleGeometry = ol.geom.Circle;
const PolygonGeometry = ol.geom.Polygon;
const LineStringGeometry = ol.geom.LineString;

// Sphere components
const Sphere = ol.Sphere;
const getArea = ol.sphere.getArea;
const getLength = ol.sphere.getLength;
const getDistance = ol.sphere.getDistance;

// Feature components
const Feature = ol.Feature;

// Condition components
const ShiftKeyOnly = ol.events.condition.shiftKeyOnly;
const unByKey = ol.Observable;

ol.proj.proj4.register(proj4);

const host = "http://" + window.location.hostname + ':' + window.location.port;
const staticURL = host + '/static';

const defaultExtent = [47.384, 42.8972, 47.6176, 43.059];

// -----------------
// Layers definition
// -----------------

let tileLayer;

let layerOSM = new TileLayer({
    'title': 'osm', source: new XYZSource({ url: host + '/tiles/osm/{z}/{x}/{y}.png' }),
});

let layer2gis = new TileLayer({
    'title': '2gis', source: new XYZSource({ url: host + '/tiles/2gis/{z}/{x}/{y}.png' }),
});

tileLayer = layer2gis;

// ----------------------
// Map control definition
// ----------------------

const scaleControl = new ScaleLineControl({ units: "metric" });
const zoomSliderControl = new ZoomSliderControl();
const fullScreenControl = new FullScreenControl();
const rotateControl = new RotateControl();
const controls = [scaleControl, rotateControl, fullScreenControl];

// --------------------------
// Map interaction definition
// --------------------------

const dragRotateInteraction = new DragRotateInteraction();
const interactions = [dragRotateInteraction];

// --------------
// Map definition
// --------------

let map = new olMap({
    controls: defaultControls.defaults({ attribution: false }).extend(controls),
    interactions: defaultInteractions.defaults().extend(interactions),
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
    const viewCenter = getExtentCenter(mapExtent);
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
                geometry: new PointGeometry(center),
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