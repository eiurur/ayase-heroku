(function() {
  var async, connpass, connpassGetLimitNum, connpassOrderStarted, moment, my, request, s, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my');

  connpass = require('./save-connpass');

  async = require('async');

  connpassGetLimitNum = 100;

  connpassOrderStarted = 2;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.getEventFromConnpass = function() {
    async.waterfall([
      function(callback) {
        var options;
        options = {
          url: 'http://connpass.com/api/v1/event/?order=2',
          json: true
        };
        return request.get(options, function(err, res, body) {
          var loopNum;
          if (err) {
            return console.log(err);
          }
          loopNum = Math.floor(body.results_available / connpassGetLimitNum);
          return callback(null, loopNum);
        });
      }, function(loopNum, callback) {
        var now, num, options, p, _i, _results;
        now = moment().format();
        _results = [];
        for (num = _i = 0; 0 <= loopNum ? _i <= loopNum : _i >= loopNum; num = 0 <= loopNum ? ++_i : --_i) {
          p = my.createParams({
            start: num * connpassGetLimitNum,
            count: connpassGetLimitNum,
            order: connpassOrderStarted
          });
          options = {
            url: "http://connpass.com/api/v1/event/?" + p,
            json: true
          };
          _results.push(request.get(options, function(err, res, body) {
            var json, _j, _len, _ref;
            _ref = body.events;
            for (_j = 0, _len = _ref.length; _j < _len; _j++) {
              json = _ref[_j];
              if (my.formatX(json.started_at) < my.formatX(now)) {
                return;
              }
              if (_.isEmpty(json.hash_tag)) {
                continue;
              }
              if (my.include(s.NG_KEYWORDS, json.hash_tag)) {
                continue;
              }
              connpass.save(json);
            }
            return callback(null, loopNum, "got conpass");
          }));
        }
        return _results;
      }
    ], function(err, loopNum, arg2) {
      if (err) {
        return console.error(err);
      } else {
        console.log("get-connpass done...");
        return console.log(loopNum + arg2);
      }
    });
    return "sadssadsld@psl@";
  };

}).call(this);
