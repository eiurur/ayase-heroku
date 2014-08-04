(function() {
  var act, client, my, request, s, saveATND, _;

  _ = require('underscore-node');

  request = require('request');

  client = require('cheerio-httpcli');

  my = require('./my');

  saveATND = require('./save-atnd');

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  act = function(json) {
    return client.fetch(json.event_url, function(err, $, res) {
      var hashTag;
      hashTag = $('.symbol-hash + a').eq(0).text();
      if (_.isEmpty(hashTag) || _.isNull(hashTag)) {
        return;
      }
      hashTag = hashTag.replace(/[#＃\n]/g, "");
      my.c("--------------  ATND  -------------");
      my.c($("title").text());
      my.c("url", json.event_url);
      my.c("置換後のハッシュタグ", hashTag);
      if (my.include(s.NG_KEYWORDS, hashTag)) {
        return;
      }
      return saveATND.save(json, hashTag);
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
