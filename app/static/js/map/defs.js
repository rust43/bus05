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
const olTextStyle = ol.style.Text;
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
const olGetArea = ol.sphere.getArea;
const olGetLength = ol.sphere.getLength;
const olGetDistance = ol.sphere.getDistance;

// Feature components
const olFeature = ol.Feature;
const olGeoJSON = ol.format.GeoJSON;

// Condition components
const olShiftKeyOnly = ol.events.condition.shiftKeyOnly;
const olAltKeyOnly = ol.events.condition.altKeyOnly;
const olAltShiftKeysOnly = ol.events.condition.altShiftKeysOnly;
const olSingleClick = ol.events.condition.singleClick;
const olUnByKey = ol.Observable;