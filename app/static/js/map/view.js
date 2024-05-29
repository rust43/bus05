// -------------------
// Map style functions
// -------------------

const mapStyleFunction = (function () {
    const styles = {};
    styles['default'] = [
        new olStyle({
            image: new olCircleStyle({
                fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
                stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 }),
                radius: 5
            }),
            fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
            stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 })
        })];
    styles['path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#308C00', width: 3 })
        })];
    styles['new-path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#029dbf', width: 4 })
        })];
    styles['busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop.png',
                anchor: [0.5, 0.5],
                width: 30,
                height: 30
            })
        })];
    styles['new-busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop.png',
                anchor: [0.5, 0.5],
                width: 30,
                height: 30
            })
        })];

    return function (feature) {
        const featureType = feature.get('type');
        let style = styles[featureType] || styles['default'];
        if (featureType === 'path' || featureType === 'new-path') {
            return DrawArrows(feature, style, 10, 10);
        }
        return style;
    };
})();

const mapOverlayStyleFunction = (function () {
    const styles = {};
    styles['default'] = [
        new olStyle({
            image: new olCircleStyle({
                fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
                stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 }),
                radius: 5
            }),
            fill: new olFillStyle({ color: 'rgba(255,255,255,0.4)' }),
            stroke: new olStrokeStyle({ color: '#3399CC', width: 1.25 })
        })
    ];
    styles['path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#20c200', width: 4 })
        })
    ];
    styles['new-path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#0d6efd', width: 4 })
        })
    ];
    styles['busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop-selected.png',
                anchor: [0.5, 0.95],
                width: 60,
                height: 60
            })
        })
    ];
    styles['new-busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop-selected.png',
                anchor: [0.5, 0.95],
                width: 60,
                height: 60
            })
        })
    ];

    return function (feature) {
        const featureType = feature.get('type');
        let style = styles[featureType] || styles['default'];
        if (featureType === 'path' || featureType === 'new-path') {
            return DrawArrows(feature, style, 18, 18);
        }
        return style;
    };
})();

// Select interaction
const mapSelectInteraction = new olSelectInteraction({
    wrapX: false,
    hitTolerance: 10,
    style: mapOverlayStyleFunction,
});

// Add interactions
map.addInteraction(mapSelectInteraction);

// Function for drawing arrows
function DrawArrows(feature, style, height, width) {
    const styles = [style[0]];
    const geometry = feature.getGeometry();
    const strokeColor = style[0].getStroke().getColor();
    const arrowImage = function (rotation) {
        return new olIconStyle({
            crossOrigin: 'anonymous',
            src: staticURL + '/pictures/arrow.png',
            color: strokeColor,
            width: width,
            height: height,
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: -rotation
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
                image: arrowImage(rotation)
            })
        );
    });
    return styles;
}

function PanToFeature(feature) {
    map.getView().fit(feature.getGeometry(), { duration: 500 });
}

// ----------------------
// Map popup functions
// ----------------------

const popupContainer = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupCloser = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
const mapOverlay = new olOverlay({
    element: popupContainer,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

map.addOverlay(mapOverlay);

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
popupCloser.onclick = function () {
    mapOverlay.setPosition(undefined);
    popupCloser.blur();
    return false;
};