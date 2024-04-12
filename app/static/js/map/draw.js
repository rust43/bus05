// ---------------------------
// Map interaction definitions
// ---------------------------

// Select interaction

const select = new SelectInteraction({
    wrapX: false, hitTolerance: 10,
});

let selectedFeature;

select.on('select', function () {
    const features = select.getFeatures();
    selectedFeature = features.getArray()[0];
    if (!selectedFeature) {
        document.getElementById('object-params').classList.add("d-none");
        return;
    }
    document.getElementById('object-params').classList.remove("d-none");
    const name = selectedFeature.get('name');
    const height = selectedFeature.get('height');
    const speed = selectedFeature.get('speed');
    let fillColor = selectedFeature.get('fillColor');
    if (fillColor) fillColor = fillColor.substring(5, fillColor.length - 1); else fillColor = "255,255,255,0.4";
    const strokeColor = selectedFeature.get('strokeColor') || "#3399CC";
    const strokeWidth = selectedFeature.get('strokeWidth') || 1.2;
    const objectIcon = selectedFeature.get('objectIcon') || "default";

    if (name !== undefined) document.getElementById('name').value = name; else document.getElementById('name').value = "";
    if (height !== undefined) document.getElementById('height').value = height; else document.getElementById('height').value = "0";
    if (speed !== undefined) document.getElementById('speed').value = speed; else document.getElementById('speed').value = "0";

    document.getElementById("fillColor").value = rgbToHex(fillColor);
    document.getElementById("fillColorAlpha").value = parseFloat(fillColor.split(',')[3]);
    document.getElementById("strokeColor").value = strokeColor
    document.getElementById("strokeWidth").value = parseFloat(strokeWidth);
    const imgSelect = document.getElementById("object-icon");
    imgSelect.value = objectIcon
    imgSelect.dispatchEvent(new Event('change'))

    // Apply style to selected element
    SetFeatureStyle();
});

// Modify interaction

const modify = new ModifyInteraction({
    features: select.getFeatures(),
});

// Translate interaction

const translate = new TranslateInteraction({
    features: select.getFeatures(), condition: ShiftKeyOnly,
});

// Add interactions
map.addInteraction(select);
map.addInteraction(modify);
map.addInteraction(translate);

// -----------
// Map drawing
// -----------

let draw;

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
    draw = new DrawInteraction({
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
    });
}

let deleteFeature = function (evt) {
    if (evt.keyCode === 46) RemoveSelectedFeature();
};
document.addEventListener('keydown', deleteFeature, false);

// --------------------------
// Feature style manipulation
// --------------------------

function SetFeatureStyle() {
    if (selectedFeature === undefined) return;

    let fillColor = document.getElementById("fillColor").value;
    let fillAlpha = document.getElementById("fillColorAlpha").value;
    let strokeColor = document.getElementById("strokeColor").value;
    let strokeWidth = document.getElementById("strokeWidth").value;
    let objectIcon = document.getElementById("object-icon").value;

    fillColor = hexToRGB(fillColor, fillAlpha);

    const fill = new FillStyle({color: fillColor});
    const stroke = new StrokeStyle({color: strokeColor, width: strokeWidth});

    if (objectIcon !== "default") {
        selectedFeature.setStyle(
            new Style({
                image: new IconStyle({
                    anchor: [0.5, 250],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: staticURL + "/map_icons/" + objectIcon,
                    width: 50,
                    height: 50,
                }),
            }),
        );
    } else {
        selectedFeature.setStyle(new Style({
            image: new CircleStyle({fill: fill, stroke: stroke, radius: 5}), fill: fill, stroke: stroke,
        }));
    }

    selectedFeature.set('fillColor', fillColor);
    selectedFeature.set('strokeColor', strokeColor);
    selectedFeature.set('strokeWidth', strokeWidth);
    selectedFeature.changed();
}

function SetFeatureImage() {
    if (selectedFeature === undefined) return;
    if (selectedFeature.getGeometry().getType() !== "Point") return;
    let objectIcon = document.getElementById("object-icon").value;
    let selectedObjectIcon = document.getElementById("selected-object-icon");
    if (objectIcon !== "default") selectedObjectIcon.classList.remove("d-none");
    else selectedObjectIcon.classList.add("d-none");
    selectedObjectIcon.src = staticURL + "/map_icons/" + objectIcon;
    selectedFeature.set('objectIcon', objectIcon);
    SetFeatureStyle();
}

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

// -----------------------
// Feature props functions
// -----------------------

const setFeatureProp = function (prop) {
    if (!selectedFeature) return;
    const value = document.getElementById(prop).value;
    selectedFeature.set(prop, value);
};


// function calculateCenter(geometry) {
//     let center, coordinates, minRadius;
//     const type = geometry.getType();
//     if (type === 'Polygon') {
//         let x = 0;
//         let y = 0;
//         let i = 0;
//         coordinates = geometry.getCoordinates()[0].slice(1);
//         coordinates.forEach(function (coordinate) {
//             x += coordinate[0];
//             y += coordinate[1];
//             i++;
//         });
//         center = [x / i, y / i];
//     } else if (type === 'LineString') {
//         center = geometry.getCoordinateAt(0.5);
//         coordinates = geometry.getCoordinates();
//     } else {
//         center = getCenter(geometry.getExtent());
//     }
//     let sqDistances;
//     if (coordinates) {
//         sqDistances = coordinates.map(function (coordinate) {
//             const dx = coordinate[0] - center[0];
//             const dy = coordinate[1] - center[1];
//             return dx * dx + dy * dy;
//         });
//         minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
//     } else {
//         minRadius =
//             Math.max(
//                 getWidth(geometry.getExtent()),
//                 getHeight(geometry.getExtent())
//             ) / 3;
//     }
//     return {
//         center: center,
//         coordinates: coordinates,
//         minRadius: minRadius,
//         sqDistances: sqDistances,
//     };
// }