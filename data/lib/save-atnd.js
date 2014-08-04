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
    startedDate = my.formatYMD(json.started_at);
    if (_.isNull(json.ended_at)) {
      json.ended_at = my.endBrinkFormatYMDHms(startedDate);
    }
    return EventProvider.countDuplicatedEvent({
      serviceName: 'atnd',
      eventId: json.event_id
    }, function(err, num) {
      if (num === 0) {
        console.log(hashTag);
        return EventProvider.save({
          serviceName: 'atnd',
          eventId: json.event_id,
          title: json.title,
          description: json.description,
          eventUrl: json.event_url,
          hashTag: hashTag,
          startedDate: startedDate,
          startedAt: json.started_at,
          endedAt: json.ended_at,
          updatedAt: json.updated_at
        }, function(error, data) {});
      }
    });
  };

}).call(this);
