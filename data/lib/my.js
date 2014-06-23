(function() {
  var moment, util;

  util = require('util');

  moment = require('moment');

  exports.c = function(desciption, str) {
    desciption = desciption || '';
    str = str || '';
    return console.log("" + desciption + ": " + str);
  };

  exports.dump = function(obj) {
    return console.log(util.inspect(obj, false, null));
  };

  exports.include = function(array, str) {
    return !array.every(function(elem, idx, array) {
      return str.indexOf(elem) === -1;
    });
  };

  exports.createParams = function(params) {
    var k, v;
    return ((function() {
      var _results;
      _results = [];
      for (k in params) {
        v = params[k];
        _results.push("" + k + "=" + v);
      }
      return _results;
    })()).join('&');
  };

  exports.formatYMDHms = function(time) {
    return moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss");
  };

  exports.formatX = function(time) {
    return moment(time).format("X");
  };

  exports.addHoursFormatYMDHms = function(hours, time) {
    return moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss");
  };

}).call(this);
