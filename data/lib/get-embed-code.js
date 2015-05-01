(function() {
  var _, client, my, request, s;

  _ = require('underscore-node');

  request = require('request');

  client = require('cheerio-httpcli');

  my = require('./my').my;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.getEmbedCode = function(params, callback) {
    return client.fetch(params.url, function(err, $, res) {
      var element, embedCode, id, meta, ptn;
      embedCode = void 0;
      if (params.serviceName === 'slideshare') {
        my.c("--------------  slideshare  -------------");
        meta = $('meta[name="twitter:player"]').attr('value');
        ptn = /(\/\/www.slideshare.net\/slideshow\/embed_code\/key\/[\w]*)/i;
        element = ptn.exec(meta);
        if (!_.isNull(element)) {
          id = ptn.exec(meta)[1];
          embedCode = "<iframe ng-src='" + id + "' width='425' height='355' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' style='border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;' allowfullscreen></iframe>";
          my.c("meta ", meta);
          my.c("id ", id);
        }
      } else if (params.serviceName === 'speakerdeck') {
        my.c("-----------  speakerdeck  ----------");
        meta = $('meta[name="twitter:image:src"]').attr("content");
        ptn = /presentations\/([\w]*)\//i;
        element = ptn.exec(meta);
        if (!_.isNull(element)) {
          id = element[1];
          embedCode = "<script async class='speakerdeck-embed' data-id='" + id + "' data-ratio='1.33333333333333' src='//speakerdeck.com/assets/embed.js'></script>";
          my.c("meta ", meta);
          my.c("id ", id);
        }
      }
      return callback(null, embedCode);
    });
  };

}).call(this);
