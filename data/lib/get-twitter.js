(function() {
  var EventProvider, aggregate, cronJob, eventStartAndEndTime, hashTags, moment, my, request, s, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  cronJob = require('cron').CronJob;

  aggregate = require('./aggregate');

  my = require('./my').my;

  EventProvider = require('./model').EventProvider;

  hashTags = void 0;

  eventStartAndEndTime = void 0;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.getTweetFromTwitter = function() {
    var assingHasTags, getTweet, setTImekillStream;
    setTImekillStream = function(stream) {
      var cronTime, job;
      cronTime = "59 23 * * *";
      return job = new cronJob({
        cronTime: cronTime,
        onTick: function() {
          stream.destroy();
        },
        onComplete: function() {
          my.c("stream destroy Completed....");
        },
        start: true,
        timeZone: "Asia/Tokyo"
      });
    };
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
          return my.c("end");
        });
        stream.on("destroy", function(response) {
          return my.c("destroy");
        });
        setTImekillStream(stream);
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
          var obj, period;
          period = _.findWhere(num.period, {
            startedDate: nowDateYMD
          });
          return obj = {
            serviceName: num.serviceName,
            eventId: num.eventId,
            hashTag: '#' + num.hashTag,
            startedDate: period.startedDate,
            startedAt: period.startedAt,
            endedAt: period.endedAt
          };
        });
        eventStartAndEndTime = _.sortBy(eventStartAndEndTime, function(o) {
          return o.eventId;
        });
        if (!_.isEmpty(hashTags)) {
          return getTweet();
        }
      });
    };
    return assingHasTags();
  };

}).call(this);
