(function() {
  var EventProvider, aggregate, eventStartAndEndTime, hashTags, moment, my, request, s, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  aggregate = require('./aggregate');

  s = require('./settings');

  my = require('./my');

  EventProvider = require('./model').EventProvider;

  hashTags = void 0;

  eventStartAndEndTime = void 0;

  exports.getTweetFromTwitter = function() {
    var assingHasTags, getTweet;
    getTweet = function() {
      my.dump(hashTags);
      my.dump(eventStartAndEndTime);
      return s.twitter.stream("statuses/filter", {
        track: hashTags
      }, function(stream) {
        stream.on("data", function(data) {
          return aggregate.aggregate(data, eventStartAndEndTime);
        });
        stream.on("end", function(response) {
          ml.cl("end");
          return arguments_.callee();
        });
        stream.on("destroy", function(response) {
          return ml.cl("destroy");
        });
      });
    };
    assingHasTags = function() {
      var nowDateYMD;
      nowDateYMD = moment().format("YYYY-MM-DD");
      return EventProvider.findByStartedDate({
        startedDate: nowDateYMD
      }, function(err, data) {
        hashTags = _.map(data, function(num, key) {
          return '#' + num.hashTag;
        });
        eventStartAndEndTime = _.map(data, function(num, key) {
          var obj;
          return obj = {
            eventId: num.eventId,
            hashTag: '#' + num.hashTag,
            startedDate: num.startedDate,
            startedAt: num.startedAt,
            endedAt: num.endedAt
          };
        });
        if (!_.isEmpty(hashTags)) {
          return getTweet();
        }
      });
    };
    return assingHasTags();
  };

}).call(this);
