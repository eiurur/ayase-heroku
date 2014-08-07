(function() {
  var CONNPASS_GET_LIMIT_NUM, CONNPASS_ORDER_STARTED, async, formatEventData, moment, my, request, s, save, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my');

  save = require('./save');

  async = require('async');

  CONNPASS_GET_LIMIT_NUM = 100;

  CONNPASS_ORDER_STARTED = 2;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  formatEventData = function(json) {
    json.eventID = json.event_id;
    json.serviceName = 'connpass';
    json.eventURL = json.event_url;
    json.hashTag = json.hash_tag;
    json.startedDate = my.formatYMD(json.started_at);
    json.startedAt = json.started_at;
    json.endedAt = json.ended_at;
    json.updatedAt = json.updated_at;
    return json;
  };

  exports.getEventFromConnpass = function() {
    var tasks;
    tasks = [
      function(callback) {
        var options;
        options = {
          url: 'http://connpass.com/api/v1/event/?order=2',
          json: true
        };
        request.get(options, function(err, res, body) {
          var loopNum;
          if (err) {
            return console.log(err);
          }
          loopNum = Math.floor(body.results_available / CONNPASS_GET_LIMIT_NUM);
          return callback(null, loopNum);
        });
      }, function(loopNum, callback) {
        var now, num, options, p, _i;
        now = my.formatX();
        for (num = _i = 0; 0 <= loopNum ? _i <= loopNum : _i >= loopNum; num = 0 <= loopNum ? ++_i : --_i) {
          p = my.createParams({
            start: num * CONNPASS_GET_LIMIT_NUM,
            count: CONNPASS_GET_LIMIT_NUM,
            order: CONNPASS_ORDER_STARTED
          });
          options = {
            url: "http://connpass.com/api/v1/event/?" + p,
            json: true
          };
          request.get(options, function(err, res, body) {
            var json, _j, _len, _ref;
            _ref = body.events;
            for (_j = 0, _len = _ref.length; _j < _len; _j++) {
              json = _ref[_j];
              if (my.formatX(json.started_at) < now) {
                return;
              }
              if (_.isEmpty(json.hash_tag)) {
                continue;
              }
              if (my.include(s.NG_KEYWORDS, json.hash_tag)) {
                continue;
              }
              json = formatEventData(json);
              save.save(json);
            }
            return callback(null, loopNum, "got conpass");
          });
        }
      }
    ];
    async.waterfall(tasks, function(err, loopNum, arg2) {
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
