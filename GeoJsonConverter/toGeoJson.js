'use strict';

const fs = require('fs');
const path = require('path')

let rawdata = fs.readFileSync(path.join(__dirname, 'source/geoinfo-all-extensions.json'));
let source = JSON.parse(rawdata);
// console.log(source);

function dist(a, b, p) {
    let ab = [b[0] - a[0], b[1] - a[1]];
    let bp = [p[0] - b[0], p[1] - b[1]];
    let ap = [p[0] - a[0], p[1] - a[1]];

    let ab_dot_bp = ab[0] * bp[0] + ab[1] * bp[1];
    let ab_dot_ap = ab[0] * ap[0] + ab[1] * ap[1];

    let distance = 0

    //if bp is in the same direction as ab, p is closest to b
    if (ab_dot_bp > 0) {
        distance = Math.sqrt((p[0] - b[0]) * (p[0] - b[0]) + (p[1] - b[1]) * (p[1] - b[1]));
    }
    //if ap is in the opposite direction from ab, p is closest to a
    else if (ab_dot_ap < 0) {
        distance = Math.sqrt((p[0] - a[0]) * (p[0] - a[0]) + (p[1] - a[1]) * (p[1] - a[1]));
    }
    else {
        let denominator = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]);
        distance = Math.abs(ab[0] * ap[1] - ab[1] * ap[0]) / denominator;
    }
    return distance;
}

//epsilon = minimum distance that a point needs to be from a line segment formed by two other points around it
//The point is omitted if the distance < epsilon
function rdp(points, epsilon) {
    let max_distance = 0;
    let index = 0;
    let end = points.length - 1;
    //find the point farthest from the given line segment
    for (let i = 1; i < end; i++) {
        let current_distance = dist(points[0], points[end], points[i]);
        if (current_distance > max_distance) {
            max_distance = current_distance;
            index = i;
        }
    }
    let result_list = [];
    //if the point is critical, then recursively simplify
    if (max_distance > epsilon) {
        let results1 = rdp(points.slice(0, index + 1), epsilon);
        let results2 = rdp(points.slice(index), epsilon);
        result_list = results1.slice(0, results1.length - 1).concat(results2);
    }
    //else, ignore all points on the line segment
    else {
        result_list = [points[0], points[end]];
    }
    
    return result_list;
}

let provinces = {
    "type": "FeatureCollection",
    "features": []
};
let cities = {
    "type": "FeatureCollection",
    "features": []
};
let tree = [];

let maxProvinceId = 1;
let maxCityId = 1;
source.forEach(rawProvince => {
    if (rawProvince) {
        // console.log(rawProvince);
        let provice = {
            "type": "Feature",
            "id": maxProvinceId,
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [[]]
            },
            "properties": {
                "name": "",
                "level": "province",
                "citycode": "010",
                "adcode": "110000",
                "center": "116.407394,39.904211",
                "TOT_HU": 0,
                "TOT_POP": 0
            }
        }
        provice.properties.name = rawProvince.name;
        provice.properties.level = rawProvince.level;
        provice.properties.citycode = rawProvince.citycode;
        provice.properties.adcode = rawProvince.adcode;
        provice.properties.center = rawProvince.center;
        let polyline = rawProvince.polyline;
        if (polyline) {
            let points = polyline.split("|").map(function (strLine){
                return [strLine.split(";").map(function (strPoint) {
                    return strPoint.split(",").map(function (part) {
                        return Number(part);
                    }).filter(x => !!(x));
                })];
            });
            
            //compress coordinates using Ramer–Douglas–Peucker
            // points = points.slice(0, points.length - 1);
            // let eps = 0.3;
            // let number_of_points = 50;
            // while (points.length > number_of_points) {
            //     points = rdp(points, eps);
            //     eps += 0.001;
            // }
            // points.push(points[0]);

            //   for (let i= 0; i < points.length; i+=2) {
            //     let point = [];
            //     point.push(points[i]);
            //     point.push(points[i+1]);
            //     provice.geometry.coordinates.push(point);
            //   }
            provice.geometry.coordinates = points;
        }
        // console.log(provice);
        provinces.features.push(provice);
        
        let treeNode = {"label": rawProvince.name, "id": maxProvinceId, "level": rawProvince.level, "center": rawProvince.center, "items":[], isSelected: false};

        maxProvinceId += 1;
        if (rawProvince.districts) {
            rawProvince.districts.forEach(rawCity => {
                let city = {
                    "type": "Feature",
                    "id": maxCityId,
                    "geometry": {
                        "type": "Point",
                        "geometry_name": "geometry",
                        "coordinates": []
                    }, 
                    "properties": {
                        "uid": maxCityId,
                        "CITY": "",
                        "name": "",
                        "level": "city",
                        "citycode": "010",
                        "STATE": "",
                        "adcode": "110000",
                        "center": "116.407394,39.904211",
                        "TOT_HU": 1110,
                        "TOT_POP": 1110
                    }
                };

                city.properties.name = rawCity.name;
                city.properties.CITY = rawCity.name;
                city.properties.STATE = rawProvince.name;
                city.properties.level = rawCity.level;
                city.properties.citycode = rawCity.citycode;
                city.properties.adcode = rawCity.adcode;
                city.properties.center = rawCity.center;
                city.geometry.coordinates = rawCity.center.split(",").map(function (part) {
                    return Number(part);
                }).filter(x => !!(x));

                cities.features.push(city);
                let childNode = {"label": rawCity.name, "id": maxCityId, "level": rawCity.level, "center": rawCity.center, "items":[], isSelected: false};
                treeNode.items.push(childNode);
                maxCityId += 1;
            });
        }
        tree.push(treeNode);
    }

});

let data = JSON.stringify(provinces);
fs.writeFileSync(path.join(__dirname, 'target/provinces.json'), data);
let citiesData = JSON.stringify(cities);
fs.writeFileSync(path.join(__dirname, 'target/cities.json'), citiesData);
let treeData = JSON.stringify(tree);
fs.writeFileSync(path.join(__dirname, 'target/tree.json'), treeData);