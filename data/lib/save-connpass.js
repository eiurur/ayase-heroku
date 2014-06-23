(function() {
  var EventProvider, moment, my, request, s, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  s = require('./settings');

  my = require('./my');

  EventProvider = require('./model').EventProvider;

  exports.save = function(json) {
    var startedDate;
    startedDate = moment(json.started_at).format("YYYY-MM-DD");
    return EventProvider.countDuplicatedEvent({
      eventId: json.event_id
    }, function(err, num) {
      if (num === 0) {
        console.log(json.hash_tag);
        return EventProvider.save({
          eventId: json.event_id,
          title: json.title,
          "catch": json["catch"],
          description: json.description,
          eventUrl: json.event_url,
          hashTag: json.hash_tag,
          startedDate: startedDate,
          startedAt: json.started_at,
          endedAt: json.ended_at,
          ownerId: json.owner_id,
          ownerNickname: json.owner_nickname,
          ownerDisplayName: json.owner_display_name,
          updatedAt: json.updated_at
        }, function(error, data) {});
      }
    });
  };

}).call(this);
