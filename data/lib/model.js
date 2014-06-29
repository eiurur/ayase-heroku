(function() {
  var Event, EventProvider, EventSchema, ObjectId, Schema, SeriesSchema, Tweet, TweetProvider, TweetSchema, db, mongoose, uri;

  mongoose = require('mongoose');

  uri = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/Ayase';

  db = mongoose.connect(uri);

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  SeriesSchema = new Schema({
    id: Number,
    title: String,
    url: String
  });

  EventSchema = new Schema({
    eventId: Number,
    title: String,
    "catch": String,
    description: String,
    eventUrl: String,
    hashTag: String,
    startedDate: Date,
    startedAt: Date,
    endedAt: Date,
    series: [SeriesSchema],
    ownerId: String,
    ownerNickname: String,
    ownerDisplayName: String,
    updatedAt: Date,
    tweetNum: {
      type: Number,
      "default": 0
    }
  });

  TweetSchema = new Schema({
    eventId: Number,
    tweetId: Number,
    tweetIdStr: String,
    text: String,
    hashTag: String,
    createdAt: Date,
    userId: String,
    userName: String,
    screenName: String,
    profileImageUrl: String
  });

  mongoose.model('Event', EventSchema);

  mongoose.model('Tweet', TweetSchema);

  Event = mongoose.model('Event');

  Tweet = mongoose.model('Tweet');

  EventProvider = (function() {
    function EventProvider() {}

    EventProvider.prototype.findAll = function(callback) {
      console.log("------------------ find all --------------------");
      return Event.find({}, function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.findOnTheDay = function(params, callback) {
      console.log("------------- find findOnTheDay ----------------");
      return Event.find({
        startedDate: params['nowDate']
      }).sort({
        startedAt: -1
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.findInit = function(params, callback) {
      console.log("----- find init tweet greater than equal 10 -----");
      return Event.find({
        tweetNum: {
          $gte: 10
        }
      }).sort({
        startedAt: -1
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.findRest = function(params, callback) {
      console.log("----- find rest tweet greater than 0 -----");
      return Event.find({
        tweetNum: {
          $gt: 0
        }
      }).sort({
        startedAt: -1
      }).skip(params["numSkip"]).exec(function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.findByEventId = function(params, callback) {
      console.log("-------------------- find ----------------------");
      return Event.find({
        eventId: params['eventId']
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.findByStartedDate = function(params, callback) {
      console.log("----------------- find Date --------------------");
      return Event.find({
        startedDate: params['startedDate']
      }).sort({
        startedAt: -1
      }).exec(function(err, data) {
        return callback(null, data);
      });
    };

    EventProvider.prototype.countDuplicatedEvent = function(params, callback) {
      return Event.find({
        eventId: params['eventId']
      }).count().exec(function(err, num) {
        return callback(null, num);
      });
    };

    EventProvider.prototype.save = function(params, callback) {
      var event;
      console.log("-------------------- save ----------------------");
      event = new Event({
        eventId: params['eventId'],
        title: params['title'],
        "catch": params['catch'],
        description: params['description'],
        eventUrl: params['eventUrl'],
        hashTag: params['hashTag'],
        startedDate: params['startedDate'],
        startedAt: params['startedAt'],
        endedAt: params['endedAt'],
        ownerId: params['ownerId'],
        ownerNickname: params['ownerNickname'],
        ownerDisplayName: params['ownerDisplayName'],
        updatedAt: params['updatedAt']
      });
      return event.save(function(err) {
        return callback();
      });
    };

    EventProvider.prototype.updateTweetNum = function(params, callback) {
      return Event.update({
        eventId: params['eventId']
      }, {
        $inc: {
          tweetNum: 1
        }
      }, function(err) {
        return callback();
      });
    };

    EventProvider.prototype.remove = function(params, callback) {
      console.log("remove");
      return Event.remove({
        eventId: params['eventId']
      }, function(err, data) {
        return callback(null, data);
      });
    };

    return EventProvider;

  })();

  TweetProvider = (function() {
    function TweetProvider() {}

    TweetProvider.prototype.findInitByEventId = function(params, callback) {
      return Tweet.find({
        eventId: params['eventId']
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(null, data);
      });
    };

    TweetProvider.prototype.findRestByEventId = function(params, callback) {
      return Tweet.find({
        eventId: params['eventId']
      }).skip(params["numSkip"] || 0).exec(function(err, data) {
        return callback(null, data);
      });
    };

    TweetProvider.prototype.findByEventId = function(params, callback) {
      return Tweet.find({
        eventId: params['eventId']
      }, function(err, data) {
        return callback(null, data);
      });
    };

    TweetProvider.prototype.findByTweetId = function(params, callback) {
      return Tweet.find({
        tweetId: params['tweetId']
      }, function(err, data) {
        return callback(null, data);
      });
    };

    TweetProvider.prototype.findByHashTag = function(params, callback) {
      return Tweet.find({
        hashTag: params['hashTag']
      }, function(err, data) {
        return callback(null, data);
      });
    };

    TweetProvider.prototype.countDuplicatedTweet = function(params, callback) {
      return Tweet.find({
        tweetId: params['tweetId']
      }).count().exec(function(err, num) {
        return callback(null, num);
      });
    };

    TweetProvider.prototype.save = function(params, callback) {
      var tweet;
      console.log("Twitter Go ----> MongoDB");
      tweet = new Tweet({
        eventId: params['eventId'],
        tweetId: params['tweetId'],
        tweetIdStr: params['tweetIdStr'],
        text: params['text'],
        hashTag: params['hashTag'],
        createdAt: params['createdAt'],
        userId: params['userId'],
        userName: params['userName'],
        screenName: params['screenName'],
        profileImageUrl: params['profileImageUrl']
      });
      return tweet.save(function(err) {
        return callback();
      });
    };

    return TweetProvider;

  })();

  exports.EventProvider = new EventProvider();

  exports.TweetProvider = new TweetProvider();

}).call(this);
