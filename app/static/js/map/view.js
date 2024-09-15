// -------------------
// Map style functions
// -------------------

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
    })
  ];
  styles['path'] = [
    new olStyle({
      stroke: new olStrokeStyle({ color: '#308c00', width: 3 })
    })
  ];
  styles['new-path'] = [
    new olStyle({
      stroke: new olStrokeStyle({ color: '#029dbf', width: 4 })
    })
  ];
  styles['busstop'] = [
    new olStyle({
      image: new olIconStyle({
        crossOrigin: 'anonymous',
        src: staticURL + '/pictures/bus-stop.png',
        width: 18,
        height: 18
      })
    })
  ];
  styles['new-busstop'] = [
    new olStyle({
      image: new olIconStyle({
        crossOrigin: 'anonymous',
        src: staticURL + '/pictures/bus-stop.png',
        anchor: [0.5, 0.5],
        width: 30,
        height: 30
      })
    })
  ];
  return function (feature) {
    const zoom = map.getView().getZoom();
    const featureType = feature.get('type');
    let style = styles[featureType] || styles['default'];
    if (featureType === 'path' || featureType === 'new-path') {
      return drawArrows(feature, style, 10, 10, zoom);
    } else if (featureType === 'busstop') {
      if (zoom >= 15) return style;
      else return null;
    } else if (featureType === 'transport') {
      return drawTransportMarker(feature);
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
    const zoom = map.getView().getZoom();
    const featureType = feature.get('type');
    let style = styles[featureType] || styles['default'];
    if (featureType === 'path' || featureType === 'new-path') {
      return drawArrows(feature, style, 18, 18, zoom);
    } else if (featureType === 'busstop') {
      return drawBusstopText(feature, style, 14);
    } else if (featureType === 'transport') {
      return drawTransportMarker(feature);
    }
    return style;
  };
})();

// Select interaction
const mapSelectInteraction = new olSelectInteraction({
  wrapX: false,
  hitTolerance: 10,
  style: mapOverlayStyleFunction
});

// Add interactions
map.addInteraction(mapSelectInteraction);

mapSelectInteraction.on('select', (e) => {
  pauseTransportLoad = true;
  if (e.deselected.length >= 1) {
    if (e.deselected[0].get('type') === 'transport') {
      unselectTransportFeature(selectedTransportIMEI);
      selectedTransportIMEI = null;
    }
  }
  if (e.selected.length === 0) {
    // routes.clearLayer();
    return;
  }
  const feature = e.selected[0];
  const type = feature.get('type');
  if (type === 'transport') {
    let routeID = feature.get('route');
    selectedTransportIMEI = feature.get('imei');
    feature.set('selected', true);
    routes.displayRoute(routeID);
  }
  pauseTransportLoad = false;
});

// Function for drawing arrows
const drawArrows = function (feature, style, height, width, zoom) {
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
      rotation: -rotation
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
  } else {
    stepDistance = 2000;
  }
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
          image: arrowImage(rotation)
        })
      );
      markDistance += stepDistance;
    }
  });
  return styles;
};

const drawTransportMarker = function (feature) {
  const route = routes.getRoute(feature.get('route'));
  let routeName = '...';
  if (route !== null) {
    routeName = route.name;
  }
  // else return;
  let coord = feature.getGeometry().getCoordinates()[0];
  let selected = false;
  if (feature.get('selected')) {
    selected = true;
    coord = 1e10;
  }
  return [
    new olStyle({
      image: new olIconStyle({
        crossOrigin: 'anonymous',
        src: staticURL + '/pictures/plate.png',
        color: selected ? '#308c00' : '#ffffff',
        width: 30 + routeName.length * 6,
        height: 24,
        anchor: [1, 0.5]
      }),
      zIndex: coord
    }),
    new olStyle({
      image: new olIconStyle({
        crossOrigin: 'anonymous',
        src: staticURL + '/pictures/marker-bus-38.svg',
        width: selected ? 45 : 38,
        height: selected ? 45 : 38,
        anchor: [0.5, 0.6],
        rotateWithView: true,
        rotation: feature.get('course')
      }),
      text: new olTextStyle({
        text: routeName,
        font: 13 + 'px Calibri,sans-serif',
        fill: new olFillStyle({
          color: selected ? '#ffffff' : '#308c00'
        }),
        offsetX: -(routeName.length * 3 + 20)
      }),
      zIndex: coord
    }),
    new olStyle({
      image: new olIconStyle({
        color: '#ffffff',
        crossOrigin: 'anonymous',
        src: staticURL + '/pictures/bus-16.svg',
        height: selected ? 20 : 16,
        width: selected ? 20 : 16
      }),
      zIndex: coord
    })
  ];
};

const drawBusstopText = function (feature, style, size) {
  const name = feature.get('busstop_name');
  const coord = feature.getGeometry().getCoordinates()[0];
  let clonedStyle = style[0].clone();
  clonedStyle.setZIndex(coord);
  const styles = [clonedStyle];
  styles.push(
    new olStyle({
      text: new olTextStyle({
        text: name,
        font: 'bold ' + size + 'px Calibri,sans-serif',
        fill: new olFillStyle({
          color: '#3377e4'
        }),
        stroke: new olStrokeStyle({
          color: 'white',
          width: 2
        }),
        offsetY: 15
      }),
      zIndex: coord
    })
  );
  return styles;
};

const olPanToFeature = (feature) => {
  map.getView().fit(feature.getGeometry(), { duration: 500 });
};

const olSelectFeature = function (feature) {
  mapSelectInteraction.getFeatures().clear();
  mapSelectInteraction.getFeatures().push(feature);
  mapSelectInteraction.dispatchEvent({ type: 'select', selected: [feature], deselected: [] });
};

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
      duration: 250
    }
  }
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

const createFeatures = function (list, namePrefix, nameField, type) {
  let features = [];
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    let geometry = new olPointGeometry(element.location.point.geom.coordinates);
    geometry = geometry.transform('EPSG:4326', 'EPSG:3857');
    const feature = new olFeature({
      geometry: geometry,
      type: element.location.point.geom.type,
      name: namePrefix + element.id
    });
    feature.setId(element.location.point.id);
    feature.set('type', type);
    feature.set('map_object_id', element.id);
    feature.set(nameField, element.name);
    features.push(feature);
  }
  return features;
};
