(function() {
  var INTERVAL_FOR_SCRAPING_IN_MS, NUM_LIMIT_GET_EVENT_API, _, async, formatEventData, moment, my, request, s, scraping;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my').my;

  scraping = require('./scraping');

  async = require('async');

  INTERVAL_FOR_SCRAPING_IN_MS = 2000;

  NUM_LIMIT_GET_EVENT_API = 100;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  formatEventData = function(json, period) {
    json.eventID = json.event_id;
    json.serviceName = 'atnd';
    json.eventURL = json.event_url;
    json.startedDate = my.formatYMD(json.started_at);
    json.startedAt = json.started_at;
    json.endedAt = json.ended_at;
    json.updatedAt = json.updated_at;
    json.period = period;
    return json;
  };

  exports.getEventFromATND = function() {
    var isStillLeftoverNotRestoredData, page, time, ymds;
    page = 0;
    time = 0;
    ymds = my.getDaysYYYYMMDD(3);
    isStillLeftoverNotRestoredData = true;
    async.whilst(function() {
      return isStillLeftoverNotRestoredData;
    }, function(callback) {
      var options, p, termSearcheEvent;
      termSearcheEvent = _.reduce(ymds, function(memo, ymd) {
        return memo + ',' + ymd;
      });
      p = my.createParams({
        ymd: termSearcheEvent,
        start: page * NUM_LIMIT_GET_EVENT_API + 1,
        count: NUM_LIMIT_GET_EVENT_API,
        format: "json"
      });
      options = {
        url: "http://api.atnd.org/events/?" + p
      };
      request.get(options, function(err, res, body) {
        var eventNum, i, json, jsonFormated, len, period, ref;
        if (err) {
          return my.e("get-ATND request Error", err);
        }
        body = JSON.parse(body);
        ref = body.events;
        for (i = 0, len = ref.length; i < len; i++) {
          json = ref[i];
          time += INTERVAL_FOR_SCRAPING_IN_MS;
          period = my.getPeriod(json.event.started_at, json.event.ended_at);
          jsonFormated = formatEventData(json.event, period);
          scraping.scraping(jsonFormated, time);
        }
        eventNum = body.results_returned;
        if (eventNum < NUM_LIMIT_GET_EVENT_API || _.isEmpty(body.events)) {
          isStillLeftoverNotRestoredData = false;
        }
        page += 1;
        return callback();
      });
    }, function(err) {
      if (err) {
        my.e("get-ATND async Error", err);
      } else {
        my.c('finished');
      }
    });
    return "ATND";
  };

}).call(this);
