// calc.js
// measure calculations

var _ = require('underscore');
var geocrunch = require('geocrunch');

var pad = function (num) {
  return num < 10 ? '0' + num.toString() : num.toString();
};

var ddToDms = function (coordinate, posSymbol, negSymbol) {
  var dd = Math.abs(coordinate),
      d = Math.floor(dd),
      m = Math.floor((dd - d) * 60),
      s = Math.round((dd - d - (m/60)) * 3600 * 100)/100,
      directionSymbol = dd === coordinate ? posSymbol : negSymbol;
  return pad(d) + '&deg; ' + pad(m) + '\' ' + pad(s) + '" ' + directionSymbol;
};

var ddtoMga = function (last) {
    var zone55 = "+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ";
    var zone56 = "+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ";
    var zone54 = "+proj=utm +zone=54 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ";
    epsg = null;
    if (zone(last) == 55) {
        epsg = zone55;
    }
    if (zone(last) == 56) {
        epsg = zone56;
    }
    if (zone(last) == 54) {
        epsg = zone54;
    }
    return proj4(epsg, [last.lng, last.lat]);
};

var zone=function(latlng){return 1+Math.floor((latlng.lng+180)/6)};

var measure = function (latlngs) {
  var last = _.last(latlngs);
  var path = geocrunch.path(_.map(latlngs, function (latlng) {
    return [latlng.lng, latlng.lat];
  }));

  var meters = path.distance({
    units: 'meters'
  });
  var sqMeters = path.area({
    units: 'sqmeters'
  });

  return {
    lastCoord: {
      dd: {
        x: last.lng,
        y: last.lat
      },
      dms: {
        x: ddToDms(last.lng, 'E', 'W'),
        y: ddToDms(last.lat, 'N', 'S')
      },
      mga:{
        zone:zone(last),
        easting:ddtoMga(last)[0],
        northing:ddtoMga(last)[1]}
    },
    length: meters,
    area: sqMeters
  };
};

module.exports = {
  measure: measure // `measure(latLngArray)` - returns object with calced measurements for passed points
};