// ----------------------
// Map edit functions
// ----------------------

// Modify interaction

const mapModifyInteraction = new olModifyInteraction({
    features: mapSelectInteraction.getFeatures(),
    // hitDetection: [newBusStopVectorLayer],
    // source: [newBusStopVectorSource],
});

// Translate interaction

const mapTranslateInteraction = new olTranslateInteraction({
    features: mapSelectInteraction.getFeatures(),
    condition: olShiftKeyOnly,
});

// Add interactions
map.addInteraction(mapModifyInteraction);
map.addInteraction(mapTranslateInteraction);

// -----------
// Map drawing
// -----------

let mapDrawInteraction = null;
let mapSnapInteraction = null;

function DrawShape(type) {
    map.removeInteraction(mapSelectInteraction);
    map.removeInteraction(mapModifyInteraction);
    map.removeInteraction(mapTranslateInteraction);
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);

    let geometryType;
    let geometryFunction;

    if (type === 'Box') {
        geometryType = 'Circle';
        geometryFunction = DrawInteraction.createBox();
    } else {
        geometryType = type;
    }
    mapDrawInteraction = new olDrawInteraction({
        source: objectVectorSource, type: geometryType, geometryFunction: geometryFunction, pixelTolerance: 50,
    });
    mapDrawInteraction.on('drawend', function () {
        map.removeInteraction(mapDrawInteraction);
        map.addInteraction(mapSelectInteraction);
        map.addInteraction(mapModifyInteraction);
        map.addInteraction(mapTranslateInteraction);
    });
    map.addInteraction(mapDrawInteraction);
}

// ------------------
// Keydown functions
// ------------------

let cancelEditMode = function (evt) {
    if (evt.keyCode === 27) {
        map.removeInteraction(mapDrawInteraction);
        map.removeInteraction(mapSnapInteraction);
        map.addInteraction(mapSelectInteraction);
        map.addInteraction(mapModifyInteraction);
        map.addInteraction(mapTranslateInteraction);
    }
};
document.addEventListener('keydown', cancelEditMode, false);

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