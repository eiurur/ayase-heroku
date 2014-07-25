(function() {
  var EventProvider, moment, my, request, s, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my');

  EventProvider = require('./model').EventProvider;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.save = function(json, hashTag) {
    var startedDate;
    startedDate = my.formatYMD(json.starts_at);
    return EventProvider.countDuplicatedEvent({
      serviceName: 'doorkeeper',
      eventId: json.id
    }, function(err, num) {
      if (num === 0) {
        console.log(hashTag);
        return EventProvider.save({
          serviceName: 'doorkeeper',
          eventId: json.id,
          title: json.title,
          description: json.description,
          eventUrl: json.public_url,
          hashTag: hashTag,
          startedDate: startedDate,
          startedAt: json.starts_at,
          endedAt: json.ends_at,
          updatedAt: json.updated_at
        }, function(error, data) {});
      }
    });
  };

}).call(this);
