(function() {
  var EventProvider, _, moment, my, s;

  _ = require('underscore-node');

  moment = require('moment');

  my = require('./my').my;

  EventProvider = require('./model').EventProvider;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  exports.clearEventData = function() {
    var date;
    date = my.addDaysFormatYMDHms('-7');
    return EventProvider.clear({
      date: date
    }, function(err) {
      if (err) {
        return my.dump(err);
      }
    });
  };

  exports.clearTweetData = function() {
    var date;
    date = my.addDaysFormatYMDHms('-7');
    return TweetProvider.clear({
      date: date
    }, function(err) {
      if (err) {
        return my.dump(err);
      }
    });
  };

}).call(this);
