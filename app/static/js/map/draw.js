// ---------------------------
// Map interaction definitions
// ---------------------------

// Select interaction

const select = new olSelectInteraction({
    wrapX: false,
    hitTolerance: 10,
});

let selectedFeature = null;

const selectFunction = function () {
    const feature = select.getFeatures().getArray()[0];
    if (selectedFeature !== null) {
        selectedFeature.setStyle(undefined);
        selectedFeature = null;
    }
    if (!feature) return;
    selectedFeature = feature;
    SetFeatureSelectedStyle(feature);
};

select.on('select', selectFunction);

// Modify interaction

const modify = new olModifyInteraction({
    features: select.getFeatures(),
});

// Translate interaction

const translate = new olTranslateInteraction({
    features: select.getFeatures(),
    condition: olShiftKeyOnly,
});

// Add interactions
map.addInteraction(select);
map.addInteraction(modify);
map.addInteraction(translate);

// -----------
// Map drawing
// -----------

let draw = null;
let snap = null;

function DrawShape(type) {

    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(translate);

    if (draw) map.removeInteraction(draw);

    let geometryType;
    let geometryFunction;

    if (type === 'Box') {
        geometryType = 'Circle';
        geometryFunction = DrawInteraction.createBox();
    } else {
        geometryType = type;
    }
    draw = new olDrawInteraction({
        source: objectVectorSource, type: geometryType, geometryFunction: geometryFunction, pixelTolerance: 50,
    });
    draw.on('drawend', function () {
        map.removeInteraction(draw);
        map.addInteraction(select);
        map.addInteraction(modify);
        map.addInteraction(translate);
    });
    map.addInteraction(draw);
}

// ----------------
// Feature removing
// ----------------

function RemoveSelectedFeature() {
    select.getFeatures().forEach(function (feature) {
        objectVectorSource.removeFeature(feature);
        routeVectorSource.removeFeature(feature);
    });
}

let deleteFeature = function (evt) {
    if (evt.keyCode === 46) RemoveSelectedFeature();
    if (evt.keyCode === 27) {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.addInteraction(select);
        map.addInteraction(modify);
        map.addInteraction(translate);
    }
};
document.addEventListener('keydown', deleteFeature, false);

// --------------------------
// Color conversion functions
// --------------------------

function hexToRGB(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (alpha) return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")"; else return "rgb(" + r + ", " + g + ", " + b + ")";
}

function rgbToHex(rgb) {
    let r = rgb.split(',')[0], g = rgb.split(',')[1], b = rgb.split(',')[2];
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function SetFeatureSelectedStyle(feature) {
    if (!feature) return;
    const fillColor = feature.get("fillColor") || "rgba(255,255,255,0.4)";
    const strokeColor = "#3399CC";
    const strokeWidth = 5;
    const fill = new olFillStyle({ color: fillColor });
    const stroke = new olStrokeStyle({ color: strokeColor, width: strokeWidth });
    const styles = [
        new olStyle({
            image: new olCircleStyle({ fill: fill, stroke: stroke, radius: 5 }),
            fill: fill,
            stroke: stroke
        })
    ];

    if (feature.get('arrow') === 'true') {
        const geometry = feature.getGeometry();
        const newImage = function (rotation) {
            return new olIconStyle({
                src: staticURL + "/pictures/arrow.png",
                anchor: [0.65, 0.5],
                rotateWithView: true,
                rotation: -rotation,
            });
        };
        geometry.forEachSegment(function (start, end) {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            const center = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2];
            // arrows
            styles.push(
                new olStyle({
                    geometry: new olPointGeometry(center),
                    image: newImage(rotation),
                }),
            );
        });
    }

    feature.setStyle(styles);
    feature.changed();
}