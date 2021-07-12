'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('./source/geoinfo-all-extensions.json');
let source = JSON.parse(rawdata);
// console.log(source);

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
                "type": "Polygon",
                "coordinates": []
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
            let points = polyline.split(";").map(function (strPoint) {
                return strPoint.split(",").map(function (part) {
                    return Number(part);
                }).filter(x => !!(x));
            });
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
fs.writeFileSync('./target/provinces.json', data);
let citiesData = JSON.stringify(cities);
fs.writeFileSync('./target/cities.json', citiesData);
let treeData = JSON.stringify(tree);
fs.writeFileSync('./target/tree.json', treeData);