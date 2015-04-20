(function() {
  var EventProvider, _, moment, my, request, s;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  my = require('./my').my;

  EventProvider = require('./model').EventProvider;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.save = function(json) {
    return EventProvider.countDuplicatedEvent({
      serviceName: json.serviceName,
      eventId: json.eventID
    }, function(err, num) {
      if (num === 0) {
        console.log(json.hashTag);
        console.log(json.period);
        return EventProvider.save({
          serviceName: json.serviceName,
          eventId: json.eventID,
          title: json.title,
          description: json.description,
          eventUrl: json.eventURL,
          hashTag: json.hashTag,
          startedDate: json.startedDate,
          startedAt: json.startedAt,
          endedAt: json.endedAt,
          updatedAt: json.updatedAt,
          period: json.period
        }, function(err) {
          if (err) {
            my.dump(err);
          }
          return EventProvider.insertPeriod({
            serviceName: json.serviceName,
            eventId: json.eventID,
            period: json.period
          }, function(err, data) {});
        });
      }
    });
  };

}).call(this);
