const inputClearHelper = (input) => {
    input.value = '';
    input.classList.remove('is-valid');
    input.classList.remove('is-invalid');
};

const validationHelper = (input) => {
    if (input && input.value) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        return false;
    }
};

const selectClearHelper = (select) => {
    select.selectedIndex = 0;
    select.classList.remove('is-valid');
    select.classList.remove('is-invalid');
};

const featureDrawClearHelper = (feature, vectorSource, input, flag = null, callback = null) => {
    if (feature !== null) {
        vectorSource.removeFeature(feature);
    }
    inputClearHelper(input);
    if (flag !== null && callback !== null) {
        callback(flag);
    }
};

const drawTypes = {
    point: 'Point',
    line: 'LineString'
};

const startDraw = (vectorSource, type) => {
    // removing interactions before draw
    map.removeInteraction(mapSelectInteraction);
    map.removeInteraction(mapModifyInteraction);
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);
    mapDrawInteraction = new olDrawInteraction({ source: vectorSource, type: type, pixelTolerance: 50 });
    mapSnapInteraction = new olSnapInteraction({ source: vectorSource });
};

const cancelDraw = () => {
    map.removeInteraction(mapDrawInteraction);
    map.removeInteraction(mapSnapInteraction);
    map.addInteraction(mapSelectInteraction);
};

const clearDict = (dict) => {
    for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) delete dict[prop];
    }
};
