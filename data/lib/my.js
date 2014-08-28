(function() {
  var moment, my, util;

  util = require('util');

  moment = require('moment');

  my = function() {
    return {
      c: function(desciption, str) {
        desciption = desciption || '';
        str = str || '';
        return console.log("" + desciption + ": " + str);
      },
      e: function(desciption, str) {
        desciption = desciption || '';
        str = str || '';
        return console.error("" + desciption + ": " + str);
      },
      dump: function(obj) {
        return console.log(util.inspect(obj, false, null));
      },
      include: function(array, str) {
        return !array.every(function(elem, idx, array) {
          return str.indexOf(elem) === -1;
        });
      },
      createParams: function(params) {
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
      },
      formatX: function(time) {
        if (time != null) {
          return moment(time).format("X");
        } else {
          return moment().format("X");
        }
      },
      formatYMD: function(time) {
        if (time != null) {
          return moment(new Date(time)).format("YYYY-MM-DD");
        } else {
          return moment().format("YYYY-MM-DD");
        }
      },
      formatYMDHms: function(time) {
        if (time != null) {
          return moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment().format("YYYY-MM-DD HH:mm:ss");
        }
      },
      addHoursFormatYMD: function(hours, time) {
        if (time != null) {
          return moment(new Date(time)).add('h', hours).format("YYYY-MM-DD");
        } else {
          return moment().add('h', hours).format("YYYY-MM-DD");
        }
      },
      addHoursFormatYMDHms: function(hours, time) {
        if (time != null) {
          return moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment().add('h', hours).format("YYYY-MM-DD HH:mm:ss");
        }
      },
      addDaysFormatYMDHms: function(days, time) {
        if (time != null) {
          return moment(new Date(time)).add('d', days).format("YYYY-MM-DD HH:mm:ss");
        } else {
          return moment().add('d', days).format("YYYY-MM-DD HH:mm:ss");
        }
      },
      addDaysFormatYMD: function(days, time) {
        if (time != null) {
          return moment(new Date(time)).add('d', days).format("YYYY-MM-DD");
        } else {
          return moment().add('d', days).format("YYYY-MM-DD");
        }
      },
      addDaysFormatYYYYMMDD: function(days, time) {
        if (time != null) {
          return moment(new Date(time)).add('d', days).format("YYYYMMDD");
        } else {
          return moment().add('d', days).format("YYYYMMDD");
        }
      },
      getDaysYYYYMMDD: function(days) {
        var day, ymds, _i;
        ymds = [];
        for (day = _i = 0; 0 <= days ? _i < days : _i > days; day = 0 <= days ? ++_i : --_i) {
          ymds[day] = moment(new Date()).add('d', day).format("YYYYMMDD");
          console.log(ymds);
        }
        return ymds;
      },
      endBrinkFormatYMDHms: function(time) {
        if (time != null) {
          return moment(time + " 23:59:59").format("YYYY-MM-DD HH:mm:ss");
        }
      },
      rigthAfterStartingFormatYMDHms: function(time) {
        if (time != null) {
          return moment(time + " 00:00:00").format("YYYY-MM-DD HH:mm:ss");
        }
      },
      isSameDay: function(startTimeYMD, endTimeYMD) {
        if (startTimeYMD === endTimeYMD) {
          return true;
        } else {
          return false;
        }
      },
      getPeriod: function(startTime, endTime) {
        var diffDays, endTimeYMD, i, middleTime, period, startTimeYMD, _i;
        period = [];
        startTimeYMD = this.formatYMD(startTime);
        endTimeYMD = this.formatYMD(endTime);
        if (this.isSameDay(startTimeYMD, endTimeYMD)) {
          period[0] = {
            startedAt: startTime,
            startedDate: startTimeYMD,
            endedAt: endTime
          };
        } else {
          diffDays = moment(endTimeYMD).diff(moment(startTimeYMD), "days");
          for (i = _i = 0; 0 <= diffDays ? _i <= diffDays : _i >= diffDays; i = 0 <= diffDays ? ++_i : --_i) {
            if (i === 0) {
              period[i] = {
                startedAt: startTime,
                startedDate: startTimeYMD,
                endedAt: this.endBrinkFormatYMDHms(startTimeYMD)
              };
            } else if (i !== diffDays) {
              middleTime = this.addDaysFormatYMD(i, startTime);
              period[i] = {
                startedAt: this.rigthAfterStartingFormatYMDHms(middleTime),
                startedDate: this.formatYMD(middleTime),
                endedAt: this.endBrinkFormatYMDHms(middleTime)
              };
            } else {
              period[i] = {
                startedAt: this.rigthAfterStartingFormatYMDHms(endTimeYMD),
                startedDate: endTimeYMD,
                endedAt: endTime
              };
            }
          }
        }
        return period;
      }
    };
  };

  exports.my = my();

}).call(this);
