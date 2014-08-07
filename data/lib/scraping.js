(function() {
  var act, client, my, request, s, save, _;

  _ = require('underscore-node');

  request = require('request');

  client = require('cheerio-httpcli');

  my = require('./my');

  save = require('./save');

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  act = function(json) {
    return client.fetch(json.eventURL, function(err, $, res) {
      var hashTag;
      if (json.serviceName === 'atnd') {
        my.c("--------------  ATND  -------------");
        hashTag = $('.symbol-hash + a').eq(0).text();
        my.c("ハッシュタグ", hashTag);
        my.c("URL", json.eventURL);
      } else if (json.serviceName === 'doorkeeper') {
        my.c("-----------  doorkeeper  ----------");
        hashTag = $('.client-main-links-others > a').eq(1).text();
        my.c("ハッシュタグ", hashTag);
        my.c("URL", json.eventURL);
      }
      if (_.isEmpty(hashTag) || _.isNull(hashTag)) {
        return;
      }
      hashTag = hashTag.replace(/[#＃\n]/g, "");
      if (my.include(s.NG_KEYWORDS, hashTag)) {
        return;
      }
      if (_.isNull(json.endedAt || _.isUndefined(endedAt))) {
        json.endedAt = my.endBrinkFormatYMDHms(json.startedDate);
      }
      json.hashTag = hashTag;
      return save.save(json);
    });
  };

  exports.scraping = function(json, time) {
    return (function(json, time) {
      return setTimeout((function() {
        if (my.include(s.NG_KEYWORDS, json.title)) {
          return;
        }
        if (my.include(s.NG_KEYWORDS, json.description)) {
          return;
        }
        return act(json);
      }), time);
    })(json, time);
  };

}).call(this);
