(function() {
  var ATND_GET_LIMIT_NUM, ATND_ORDER_STARTED, async, moment, my, request, s, scrapingATND, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my');

  scrapingATND = require('./scraping-atnd');

  async = require('async');

  ATND_GET_LIMIT_NUM = 100;

  ATND_ORDER_STARTED = 2;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.getEventFromATND = function() {
    var INTERVAL_FOR_SCRAPING_IN_MS, NUM_LIMIT_GET_EVENT_API, TERM_TO_GET_TARGET_EVENT, daysAfterDate, isStillLeftoverNotRestoredData, nowDate, page, time, ymds;
    INTERVAL_FOR_SCRAPING_IN_MS = 2000;
    NUM_LIMIT_GET_EVENT_API = 100;
    TERM_TO_GET_TARGET_EVENT = "3";
    ymds = my.getDaysYYYYMMDD(3);
    page = 0;
    time = 0;
    isStillLeftoverNotRestoredData = true;
    nowDate = my.formatYMD();
    daysAfterDate = my.addDaysFormatYMD(TERM_TO_GET_TARGET_EVENT);
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
        var eventNum, json, _i, _len, _ref;
        if (err) {
          return my.e("get-ATND request Error", err);
        }
        body = JSON.parse(body);
        _ref = body.events;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          json = _ref[_i];
          time += INTERVAL_FOR_SCRAPING_IN_MS;
          scrapingATND.scraping(json.event, time);
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
