'use strict';

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

let xmlParser = new xml2js.Parser();
let pipingPointsSource = fs.readFileSync(path.join(__dirname, 'source/S3DPipingPoints7232021 52641 PM.xml'));
xmlParser.parseString(pipingPointsSource, function (err, result) {
    pipingPointsSource = result;
});

let points = {
    "type": "FeatureCollection",
    "features": [],
    "properties": {
        "ApplyDate": pipingPointsSource.Points.$.ApplyDate
    }
};

pipingPointsSource.Points.Point.forEach(rawPoint => {
    if (rawPoint) {
        let point = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": []
            },
            "properties": {
                "BelongTo": ""
            }
        }
        point.properties.BelongTo = rawPoint.$.BelongTo;
        point.geometry.coordinates = [Number(rawPoint.$.X), Number(rawPoint.$.Y), Number(rawPoint.$.Z)].filter(x => !!(x));

        points.features.push(point);
    }
});

let pipingPointData = JSON.stringify(points);
fs.writeFileSync(path.join(__dirname, 'target/pipingPoints.json'), pipingPointData);