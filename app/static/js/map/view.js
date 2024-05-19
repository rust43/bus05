// ----------------------
// Map view functions
// ----------------------

// Select interaction
const mapSelectInteraction = new olSelectInteraction({ wrapX: false, hitTolerance: 10 });

// Variable for save selected feature
let selectedFeature = null;

// Select function
const mapSelectFunction = function () {
    const feature = mapSelectInteraction.getFeatures().item(0);
    if (selectedFeature !== null) {
        if (selectedFeature.get('type') === 'new-path')
            UnselectNewRouteFeature(selectedFeature.get('name'));
        selectedFeature.setStyle(setFeatureStyle(selectedFeature));
        selectedFeature = null;
    }
    if (!feature) return;
    selectedFeature = feature;
    setFeatureSelectedStyle(feature);
    if (selectedFeature.get('type') === 'new-path')
        SelectNewRouteFeature(selectedFeature.get('name'));
};

// Binding select function
mapSelectInteraction.on('select', mapSelectFunction);

// Add interactions
map.addInteraction(mapSelectInteraction);

// Styles dict
const mapViewStyles = {
    'default':
        new olStyle({
            image: new olCircleStyle({
                fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
                stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 }),
                radius: 5,
            }),
            fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
            stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 }),
        }),
    'path':
        new olStyle({
            stroke: new olStrokeStyle({ color: '#308C00', width: 3 }),
        }),
    'selected-path':
        new olStyle({
            stroke: new olStrokeStyle({ color: '#20c200', width: 4 }),
        }),
    'new-path':
        new olStyle({
            stroke: new olStrokeStyle({ color: '#029dbf', width: 4 }),
        }),
    'selected-new-path':
        new olStyle({
            stroke: new olStrokeStyle({ color: '#0d6efd', width: 4 }),
        }),
};

const setFeatureStyle = function (feature) {
    if (!feature) return;
    const featureType = feature.get('type');
    feature.setStyle(mapViewStyles[featureType]);
    if (featureType === 'path' || featureType === 'new-path')
        DrawArrows(feature, 10, 10);
};

const setFeatureSelectedStyle = function (feature) {
    if (!feature) return;
    const featureType = feature.get('type');
    feature.setStyle(mapViewStyles['selected-' + featureType]);
    if (featureType === 'path' || featureType === 'new-path')
        DrawArrows(feature, 18, 18);
};

function DrawArrows(feature, height, width) {
    const featureStyles = feature.getStyle();
    const strokeColor = featureStyles.getStroke().getColor();
    const currentStyles = [featureStyles];
    const arrowImage = function (rotation) {
        return new olIconStyle({
            crossOrigin: 'anonymous',
            src: staticURL + "/pictures/arrow.png",
            color: strokeColor,
            width: width,
            height: height,
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: -rotation,
        });
    };
    feature.getGeometry().forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
        const center = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2];
        // arrows
        currentStyles.push(
            new olStyle({
                geometry: new olPointGeometry(center),
                image: arrowImage(rotation),
            }),
        );
    });
    feature.setStyle(currentStyles);
    feature.changed();
}