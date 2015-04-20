(function() {
  var CONNPASS_GET_LIMIT_NUM, CONNPASS_ORDER_STARTED, _, async, formatEventData, moment, my, request, s, save;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my').my;

  save = require('./save');

  async = require('async');

  CONNPASS_GET_LIMIT_NUM = 100;

  CONNPASS_ORDER_STARTED = 2;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  formatEventData = function(json, period) {
    json.eventID = json.event_id;
    json.serviceName = 'connpass';
    json.eventURL = json.event_url;
    json.hashTag = json.hash_tag;
    json.startedDate = my.formatYMD(json.started_at);
    json.startedAt = json.started_at;
    json.endedAt = json.ended_at;
    json.updatedAt = json.updated_at;
    json.period = period;
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
        var i, now, num, options, p, ref;
        now = my.formatX();
        for (num = i = 0, ref = loopNum; 0 <= ref ? i <= ref : i >= ref; num = 0 <= ref ? ++i : --i) {
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
            var j, json, jsonFormated, len, period, ref1;
            ref1 = body.events;
            for (j = 0, len = ref1.length; j < len; j++) {
              json = ref1[j];
              if (my.formatX(json.started_at) < now) {
                return;
              }
              if (_.isEmpty(json.hash_tag)) {
                continue;
              }
              if (my.include(s.NG_KEYWORDS, json.hash_tag)) {
                continue;
              }
              period = my.getPeriod(json.started_at, json.ended_at);
              jsonFormated = formatEventData(json, period);
              save.save(jsonFormated);
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
