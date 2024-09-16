let testVectorSource = new olVectorSource({ wrapX: false });
let testVectorLayer = new olVectorLayer({ source: testVectorSource });
map.addLayer(testVectorLayer);

const test = async function () {
  testVectorSource.clear();

  let data = await APIGetRequest(transportAPI.direction);

  const featureTypes = {
    multiline: 'MultiLineString',
    line: 'LineString',
    point: 'Point',
    polygon: 'Polygon'
  };

  // drawFeature(data.line, testVectorSource);
  drawFeature(data.cut_path_a, testVectorSource);
  // drawFeature(data.buffer_line, testVectorSource);
  for (let i = 0; i < data.points.length; i++) {
    drawFeature(data.points[i], testVectorSource);
  }

  function drawFeature(featureJSON, vectorSource) {
    featureJSON = JSON.parse(featureJSON);
    let geometry = getGeometry(featureJSON);
    let type = featureJSON.type;
    vectorSource.addFeature(
      new olFeature({
        // geometry: geometry.transform('EPSG:4326', 'EPSG:3857'),
        geometry: geometry,
        type: type
      })
    );
  }

  function getGeometry(featureJSON) {
    const type = featureJSON.type;
    const coordinates = featureJSON.coordinates;
    switch (type) {
      case featureTypes.multiline:
        return new olMultiLineStringGeometry(coordinates);
      case featureTypes.line:
        return new olLineStringGeometry(coordinates);
      case featureTypes.point:
        return new olPointGeometry(coordinates);
      case featureTypes.polygon:
        return new olPolygonGeometry(coordinates);
      default:
        return null;
    }
  }
};
