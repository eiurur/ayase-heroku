(function() {
  var moment, util;

  util = require('util');

  moment = require('moment');

  exports.c = function(desciption, str) {
    desciption = desciption || '';
    str = str || '';
    return console.log("" + desciption + ": " + str);
  };

  exports.e = function(desciption, str) {
    desciption = desciption || '';
    str = str || '';
    return console.error("" + desciption + ": " + str);
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

  exports.formatX = function(time) {
    if (time != null) {
      return moment(time).format("X");
    } else {
      return moment().format("X");
    }
  };

  exports.formatYMD = function(time) {
    if (time != null) {
      return moment(new Date(time)).format("YYYY-MM-DD");
    } else {
      return moment().format("YYYY-MM-DD");
    }
  };

  exports.formatYMDHms = function(time) {
    if (time != null) {
      return moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss");
    } else {
      return moment().format("YYYY-MM-DD HH:mm:ss");
    }
  };

  exports.addHoursFormatYMD = function(hours, time) {
    if (time != null) {
      return moment(new Date(time)).add('h', hours).format("YYYY-MM-DD");
    } else {
      return moment().add('h', hours).format("YYYY-MM-DD");
    }
  };

  exports.addHoursFormatYMDHms = function(hours, time) {
    if (time != null) {
      return moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss");
    } else {
      return moment().add('h', hours).format("YYYY-MM-DD HH:mm:ss");
    }
  };

  exports.addDaysFormatYMD = function(days, time) {
    if (time != null) {
      return moment(new Date(time)).add('d', days).format("YYYY-MM-DD");
    } else {
      return moment().add('d', days).format("YYYY-MM-DD");
    }
  };

  exports.addDaysFormatYYYYMMDD = function(days, time) {
    if (time != null) {
      return moment(new Date(time)).add('d', days).format("YYYYMMDD");
    } else {
      return moment().add('d', days).format("YYYYMMDD");
    }
  };

  exports.getDaysYYYYMMDD = function(days) {
    var day, ymds, _i;
    ymds = [];
    for (day = _i = 0; 0 <= days ? _i < days : _i > days; day = 0 <= days ? ++_i : --_i) {
      ymds[day] = moment(new Date()).add('d', day).format("YYYYMMDD");
      console.log(ymds);
    }
    return ymds;
  };

  exports.endBrinkFormatYMDHms = function(time) {
    if (time != null) {
      return moment(time + " 23:59:59").format("YYYY-MM-DD HH:mm:ss");
    }
  };

}).call(this);
