(function() {
  var _, client, my, request, s;

  _ = require('underscore-node');

  request = require('request');

  client = require('cheerio-httpcli');

  my = require('./my').my;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.getSlideId = function(params, callback) {
    return client.fetch(params.url, function(err, $, res) {
      var element, id, meta, ptn;
      id = void 0;
      if (params.serviceName === 'slideshare') {
        my.c("--------------  slideshare  -------------");
        meta = $('meta[name="twitter:player"]').attr('value');
        ptn = /\/\/www.slideshare.net\/slideshow\/embed_code\/key\/([\w]*)/i;
        element = ptn.exec(meta);
        if (!_.isNull(element)) {
          console.log(element);
          id = element[1];
        }
      } else if (params.serviceName === 'speakerdeck') {
        my.c("-----------  speakerdeck  ----------");
        meta = $('meta[name="twitter:image:src"]').attr("content");
        ptn = /presentations\/([\w]*)\//i;
        element = ptn.exec(meta);
        if (!_.isNull(element)) {
          console.log(element);
          id = element[1];
        }
      }
      return callback(null, id);
    });
  };

}).call(this);
