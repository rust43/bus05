// -------------------
// Map style functions
// -------------------

const layerIndexes = {
    route: 3,
    busstops: 1,
    transport: 2,
}

const mapStyleFunction = (() => {
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
            stroke: new olStrokeStyle({ color: '#308c00', width: 3 }),
            zIndex: layerIndexes.route,
        })];
    styles['new-path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#029dbf', width: 4 }),
            zIndex: layerIndexes.route,
        })];
    styles['busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop.png',
                width: 18,
                height: 18,
            }),
            zIndex: layerIndexes.busstops,
        })];
    styles['new-busstop'] = [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-stop.png',
                anchor: [0.5, 0.5],
                width: 30,
                height: 30,
            }),
            zIndex: layerIndexes.busstops,
        })];
    styles['transport'] = [
        new olStyle({
            image: new olIconStyle({
                color: "#ffffff",
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-16.svg',
                height: 16,
                width: 16,
            }),
        }),
    ];
    return function (feature) {
        const zoom = map.getView().getZoom();
        const featureType = feature.get('type');
        let style = styles[featureType] || styles['default'];
        if (featureType === 'path' || featureType === 'new-path') {
            return DrawArrows(feature, style, 10, 10, zoom);
        } else if (featureType === 'busstop') {
            if (zoom >= 15) return style;
            else return null;
        } else if (featureType === 'transport') {
            return DrawTransportMarker(feature, style, 38);
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
            stroke: new olStrokeStyle({ color: '#20c200', width: 4 }),
            zIndex: 2,
        })
    ];
    styles['new-path'] = [
        new olStyle({
            stroke: new olStrokeStyle({ color: '#0d6efd', width: 4 }),
            zIndex: 2,
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
            }),
            zIndex: 1,
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
            }),
            zIndex: 1,
        })
    ];
    styles['transport'] = [
        new olStyle({
            image: new olIconStyle({
                color: "#ffffff",
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/bus-16.svg',
                height: 20,
                width: 20,
            }),
        }),
    ];
    return function (feature) {
        const zoom = map.getView().getZoom();
        const featureType = feature.get('type');
        let style = styles[featureType] || styles['default'];
        if (featureType === 'path' || featureType === 'new-path') {
            return DrawArrows(feature, style, 18, 18, zoom);
        } else if (featureType === 'busstop') {
            return DrawBusstopText(feature, style, 14);
        } else if (featureType === 'transport') {
            return DrawTransportMarker(feature, style, 45, 45);
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

mapSelectInteraction.on('select', (e) => {
    if (e.selected.length === 0) {
        if (e.deselected.length >= 1) {
            if (e.deselected[0].get('type') === 'transport') {
                ClearRouteLayer();
            }
        }
        return;
    }
    const feature = e.selected[0];
    const type = feature.get('type');
    if (type === 'transport') {
        let routeID = feature.get('route');
        DisplayRoute(routeID);
    }
});

// Function for drawing arrows
function DrawArrows(feature, style, height, width, zoom) {
    const styles = [style[0]];
    const lineString = feature.getGeometry();
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
            rotation: -rotation,
        });
    };
    const totalLenght = lineString.getLength();
    let stepDistance;
    if (zoom >= 17) {
        stepDistance = 125;
    } else if (zoom >= 15) {
        stepDistance = 250;
    } else if (zoom >= 14) {
        stepDistance = 500;
    } else if (zoom >= 13) {
        stepDistance = 1000;
    } else { stepDistance = 2000; }
    let passedDistance = 0;
    let markDistance = stepDistance;
    lineString.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
        const segmentLength = new olLineStringGeometry([start, end]).getLength();
        passedDistance += segmentLength;
        while (markDistance <= passedDistance) {
            const fraction = markDistance / totalLenght;
            const point = lineString.getCoordinateAt(fraction);
            styles.push(
                new olStyle({
                    geometry: new olPointGeometry(point),
                    image: arrowImage(rotation),
                })
            );
            markDistance += stepDistance;
        }
    });
    return styles;
}

function DrawTransportMarker(feature, style, size) {
    const route = GetRoute(feature.get('route'));
    const coord = feature.getGeometry().getCoordinates()[0];
    let routeName = '...';
    if (route !== null)
        routeName = route.name;
    let clonedStyle = style[0].clone();
    clonedStyle.setZIndex(coord);
    return [
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/plate.png',
                color: "#ffffff",
                width: 50,
                height: 24,
                anchor: [1.1, 0.5],
            }),
            zIndex: coord,
        }),
        new olStyle({
            image: new olIconStyle({
                crossOrigin: 'anonymous',
                src: staticURL + '/pictures/marker-bus-38.svg',
                width: size,
                height: size,
                anchor: [0.5, 0.6],
                rotateWithView: true,
                rotation: feature.get('course'),
            }),
            text: new olTextStyle({
                text: routeName,
                font: 13 + 'px Calibri,sans-serif',
                fill: new olFillStyle({
                    color: '#308c00',
                }),
                offsetX: -35,
            }),
            zIndex: coord,
        }),
        clonedStyle,
    ];
}

function DrawBusstopText(feature, style, size) {
    const name = feature.get('busstop_name');
    const styles = [style[0]];
    styles.push(
        new olStyle({
            text: new olTextStyle({
                text: name,
                font: 'bold ' + size + 'px Calibri,sans-serif',
                fill: new olFillStyle({
                    color: '#3377e4',
                }),
                stroke: new olStrokeStyle({
                    color: 'white',
                    width: 2,
                }),
                offsetY: 15,
            }),
            zIndex: 3,
        }),
    )
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

if (popupCloser) {
    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    popupCloser.onclick = function () {
        mapOverlay.setPosition(undefined);
        popupCloser.blur();
        return false;
    };
}

