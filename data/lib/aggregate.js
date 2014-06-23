(function() {
  var Tweet, exception, my, _;

  _ = require('underscore-node');

  exception = require('./exception');

  my = require('./my');

  Tweet = require('./Tweet');

  exports.aggregate = function(data, eventStartAndEndTime) {
    var e, tweet;
    try {
      tweet = new Tweet.Tweet(data, eventStartAndEndTime);
      tweet.isNgUser();
      tweet.assign();
      tweet.debugInAggregate();
      if (_.isUndefined(tweet.eventData)) {
        return;
      }
      tweet.formatTweetTime();
      if (!tweet.isRetweeted()) {
        tweet.check();
      }
    } catch (_error) {
      e = _error;
      if (_.isEmpty(e)) {
        my.c("空");
        return my.c(e);
      } else if (_.has(e, "message")) {
        my.c(e.message);
        return my.c(e.errorHappendAt.toString());
      } else {
        return my.dump(e);
      }
    }
  };

}).call(this);
