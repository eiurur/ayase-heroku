(function() {
  var EventProvider, act, client, moment, my, request, s, saveDK, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  client = require('cheerio-httpcli');

  my = require('./my');

  saveDK = require('./save-doorkeeper');

  EventProvider = require('./model').EventProvider;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  act = function(json) {
    return client.fetch(json.public_url, function(err, $, res) {
      var hashTag;
      console.log($("title").text());
      hashTag = $('.client-main-links-others > a').eq(1).text();
      if (_.isEmpty(hashTag)) {
        return;
      }
      hashTag = hashTag.replace(/[#＃\n]/g, "");
      my.c("--------------------------------");
      my.c("置換後のハッシュタグ", hashTag);
      if (my.include(s.NG_KEYWORDS, hashTag)) {
        return;
      }
      return saveDK.save(json, hashTag);
    });
  };

  exports.scraping = function(json, time) {
    return (function(json, time) {
      return setTimeout((function() {
        var now;
        now = my.formatX();
        if (my.include(s.NG_KEYWORDS, json.event.title)) {
          return;
        }
        if (my.include(s.NG_KEYWORDS, json.event.description)) {
          return;
        }
        return act(json.event);
      }), time);
    })(json, time);
  };

}).call(this);
