// ---------------------
// Map layers definition
// ---------------------

let objectVectorSource = new VectorSource({wrapX: false});
let objectVectorLayer = new VectorLayer({source: objectVectorSource, style: DefaultStyleFunction});
map.addLayer(objectVectorLayer);

if (document.getElementById("zone_id") !== null) {
    zone_id = document.getElementById("zone_id").value;
    GetZoneData(zone_id).then(zone_data => {
        DrawZoneObjects(zone_data, objectVectorSource);
    });
}

async function GetZoneData(zone_id) {
    let url = host + "/map/api/" + zone_id + "/";
    let response = await fetch(url, {
        method: "get", credentials: "same-origin", headers: {
            // "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json", "Content-Type": "application/json"
        }, // body: JSON.stringify(body)
    });
    if (response.ok) {
        return await response.json();
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}

function DrawZoneObjects(zone_data, vectorSource) {
    let map_objects = zone_data["map_objects"];
    let map_object = null;
    for (let i = 0; i < map_objects.length; i++) {
        map_object = map_objects[i];
        let map_object_props = map_object["props"];
        // convert props array to dict
        let props = {};
        for (let j = 0; j < map_object_props.length; j++) {
            const prop = map_object_props[j];
            props[prop["prop"]] = prop["value"];
        }
        let type = props["type"];
        let geometry;
        let coordinates;
        let db_id;
        switch (type) {
            case "Circle": {
                db_id = map_object.circle.id;
                coordinates = map_object.circle.geom.coordinates;
                geometry = new CircleGeometry(coordinates, 1);
                break;
            }
            case "Point": {
                db_id = map_object.point.id;
                coordinates = map_object.point.geom.coordinates;
                geometry = new PointGeometry(coordinates);
                break;
            }
            case "LineString": {
                db_id = map_object.line.id;
                coordinates = map_object.line.geom.coordinates;
                geometry = new LineStringGeometry(coordinates);
                break;
            }
            case "Polygon": {
                db_id = map_object.polygon.id;
                coordinates = map_object.polygon.geom.coordinates;
                geometry = new PolygonGeometry(coordinates);
                break;
            }
            default: {
                console.log("undefined");
                break;
            }
        }
        geometry = geometry.transform("EPSG:4326", "EPSG:3857");
        if (type === "Circle") {
            geometry.setRadius(parseFloat(props["radius"]));
        }
        let new_feature = new Feature({
            geometry: geometry, type: type, name: map_object['name'],
        });
        new_feature.set('db_id', db_id);
        new_feature.set('fillColor', props["fillColor"]);
        new_feature.set('strokeColor', props["strokeColor"]);
        new_feature.set('strokeWidth', props["strokeWidth"]);
        new_feature.set('height', props["height"]);
        new_feature.set('speed', props["speed"]);
        new_feature.set('objectIcon', props["objectIcon"]);
        new_feature.setStyle(DefaultStyleFunction);
        vectorSource.addFeature(new_feature);
    }
}

// -------------------------
// Default style function definition
// -------------------------

function DefaultStyleFunction(feature) {
    let fillColor = feature.get('fillColor');
    let strokeColor = feature.get('strokeColor');
    let strokeWidth = feature.get('strokeWidth');
    let objectIcon = feature.get('objectIcon');

    if (fillColor === undefined) fillColor = 'rgba(255,255,255,0.4)';
    if (strokeColor === undefined) strokeColor = '#3399CC';
    if (strokeWidth === undefined) strokeWidth = 1.25;
    if (objectIcon === undefined) objectIcon = "default";

    const fill = new FillStyle({color: fillColor});
    const stroke = new StrokeStyle({color: strokeColor, width: strokeWidth});

    if (objectIcon !== "default") {
        return new Style({
            image: new IconStyle({
                anchor: [0.5, 250],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: staticURL + "/map_icons/" + objectIcon,
                width: 50,
                height: 50,
            }),
        });
    } else {
        return new Style({
            image: new CircleStyle({
                fill: fill, stroke: stroke, radius: 5,
            }), fill: fill, stroke: stroke,
        });
    }
}