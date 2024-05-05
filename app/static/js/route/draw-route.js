// Draw interactions for new route

// ---------------------------
// Route map layers definition
// ---------------------------

let routeVectorSource = new olVectorSource({ wrapX: false });
let routeVectorLayer = new olVectorLayer({ source: routeVectorSource, style: DefaultRouteStyleFunction });
map.addLayer(routeVectorLayer);

function DrawRoute(name) {
    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(translate);
    if (draw) map.removeInteraction(draw);
    draw = new olDrawInteraction({
        source: routeVectorSource, type: 'LineString', pixelTolerance: 50
    });
    snap = new olSnapInteraction({ source: routeVectorSource });
    draw.on('drawend', function(evt) {
        const feature = evt.feature;
        feature.set('arrow', 'true');
        feature.set('name', name);
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.addInteraction(select);
        map.addInteraction(modify);
        map.addInteraction(translate);
    });
    map.addInteraction(draw);
    map.addInteraction(snap);
}

function DefaultRouteStyleFunction(feature) {
    if (!feature) return;
    const strokeColor = '#308C00';
    const strokeWidth = 3;
    const stroke = new olStrokeStyle({ color: strokeColor, width: strokeWidth });
    const styles = [new olStyle({ stroke: stroke })];
    feature.setStyle(styles);
    feature.changed();
}
