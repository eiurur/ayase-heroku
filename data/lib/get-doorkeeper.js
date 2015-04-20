(function() {
  var _, async, client, formatEventData, moment, my, request, s, scraping;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  client = require('cheerio-httpcli');

  async = require('async');

  my = require('./my').my;

  scraping = require('./scraping');

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  formatEventData = function(json, period) {
    json.eventID = json.id;
    json.serviceName = 'doorkeeper';
    json.eventURL = json.public_url;
    json.startedDate = my.formatYMD(json.starts_at);
    json.startedAt = json.starts_at;
    json.endedAt = json.ends_at;
    json.updatedAt = json.updated_at;
    json.period = period;
    return json;
  };

  exports.getEventFromDoorkeeper = function() {
    var INTERVAL_FOR_SCRAPING_IN_MS, NUM_LIMIT_GET_EVENT_API, TERM_TO_GET_TARGET_EVENT, daysAfterDate, isStillLeftoverNotRestoredData, nowDate, page, time;
    INTERVAL_FOR_SCRAPING_IN_MS = 2000;
    NUM_LIMIT_GET_EVENT_API = 25;
    TERM_TO_GET_TARGET_EVENT = "3";
    page = 1;
    time = 0;
    isStillLeftoverNotRestoredData = true;
    nowDate = my.formatYMD();
    daysAfterDate = my.addDaysFormatYMD(TERM_TO_GET_TARGET_EVENT);
    async.whilst(function() {
      return isStillLeftoverNotRestoredData;
    }, function(callback) {
      var options, p;
      p = my.createParams({
        locale: "ja",
        since: nowDate,
        until: daysAfterDate,
        sort: "starts_at"
      });
      options = {
        url: "http://api.doorkeeper.jp/events?" + p + "&page=" + page,
        json: true
      };
      request.get(options, function(err, res, body) {
        var i, json, jsonFormated, len, period;
        if (err) {
          return my.e("get-DK request Error", err);
        }
        my.c(body.length);
        my.c("page", page);
        my.c("-------------------------------------------------------------");
        for (i = 0, len = body.length; i < len; i++) {
          json = body[i];
          time += INTERVAL_FOR_SCRAPING_IN_MS;
          period = my.getPeriod(json.event.starts_at, json.event.ends_at);
          jsonFormated = formatEventData(json.event, period);
          scraping.scraping(jsonFormated, time);
        }
        if (body.length < NUM_LIMIT_GET_EVENT_API || _.isEmpty(body)) {
          isStillLeftoverNotRestoredData = false;
        }
        page += 1;
        return callback();
      });
    }, function(err) {
      if (err) {
        my.e("get-DK async Error", err);
      } else {
        my.c('finished');
      }
    });
    return "akakak";
  };

}).call(this);
