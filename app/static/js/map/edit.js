// ------------------
// Keydown functions
// ------------------

let cancelEditMode = function(evt) {
    if (evt.keyCode === 27) {
        map.removeInteraction(mapDrawInteraction);
        map.removeInteraction(mapSnapInteraction);
        map.addInteraction(mapSelectInteraction);
        // map.addInteraction(mapModifyInteraction);
        // map.addInteraction(mapTranslateInteraction);
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
    if (alpha) return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'; else return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function rgbToHex(rgb) {
    let r = rgb.split(',')[0], g = rgb.split(',')[1], b = rgb.split(',')[2];
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}