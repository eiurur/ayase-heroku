(function() {
  var Event, EventProvider, EventSchema, ObjectId, Schema, SeriesSchema, Slide, SlideProvider, SlideSchema, Tweet, TweetProvider, TweetSchema, db, mongoose, uri;

  mongoose = require('mongoose');

  uri = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/app26755501';

  db = mongoose.connect(uri);

  Schema = mongoose.Schema;

  ObjectId = Schema.ObjectId;

  SeriesSchema = new Schema({
    id: Number,
    title: String,
    url: String
  });

  EventSchema = new Schema({
    serviceName: {
      type: String,
      "default": 'connpass'
    },
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
    publicUrl: {
      type: String,
      "default": ''
    },
    tweetNum: {
      type: Number,
      "default": 0
    },
    period: {
      type: Array,
      "default": []
    }
  });

  TweetSchema = new Schema({
    serviceName: {
      type: String,
      "default": 'connpass'
    },
    eventId: Number,
    tweetId: Number,
    tweetIdStr: String,
    text: String,
    mediaUrl: String,
    displayUrl: String,
    hashTag: String,
    createdAt: Date,
    userId: String,
    userName: String,
    screenName: String,
    profileImageUrl: String
  });

  SlideSchema = new Schema({
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet'
    },
    url: String
  });

  EventSchema.index({
    eventId: -1
  });

  TweetSchema.index({
    eventId: -1
  });

  mongoose.model('Event', EventSchema);

  mongoose.model('Tweet', TweetSchema);

  mongoose.model('Slide', SlideSchema);

  Event = mongoose.model('Event');

  Tweet = mongoose.model('Tweet');

  Slide = mongoose.model('Slide');

  EventProvider = (function() {
    function EventProvider() {}

    EventProvider.prototype.findAll = function(params, callback) {
      console.log("------------------ find all --------------------");
      return Event.find({
        tweetNum: {
          $gt: 0
        }
      }).sort({
        startedAt: -1
      }).exec(function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.findOnTheDay = function(params, callback) {
      console.log("------------- find findOnTheDay ----------------");
      return Event.find({
        "$or": [
          {
            'period.startedDate': params['nowDate'],
            'startedDate': params['nowDate']
          }
        ]
      }).sort({
        startedAt: -1
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.findInit = function(params, callback) {
      console.log("----- find init tweet greater than equal 10 -----");
      return Event.find({
        tweetNum: {
          $gt: 0
        }
      }).sort({
        startedAt: -1
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(err, data);
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
        return callback(err, data);
      });
    };

    EventProvider.prototype.findMore = function(params, callback) {
      console.log("----- find More tweet greater than 0 -----");
      return Event.find({
        tweetNum: {
          $gt: 0
        }
      }).sort({
        startedAt: -1
      }).limit(10).skip(params.numSkip * 10).exec(function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.findByEventId = function(params, callback) {
      console.log("-------------------- find ----------------------");
      return Event.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).limit(params["numShow"] || 0).exec(function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.findByStartedDate = function(params, callback) {
      console.log("----------------- find Date --------------------");
      return Event.find({
        'period.startedDate': params['startedDate']
      }).sort({
        startedAt: -1
      }).exec(function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.countDuplicatedEvent = function(params, callback) {
      return Event.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).count().exec(function(err, num) {
        return callback(err, num);
      });
    };

    EventProvider.prototype.insertPeriod = function(params, callback) {
      console.log('-------------- insert period ---------------');
      return Event.update({
        serviceName: params['serviceName'],
        eventId: params['eventId']
      }, {
        $set: {
          period: params['period']
        }
      }, function(err) {
        return callback(err, params);
      });
    };

    EventProvider.prototype.save = function(params, callback) {
      var event;
      console.log("-------------------- save ----------------------");
      event = new Event({
        serviceName: params['serviceName'],
        eventId: params['eventId'],
        title: params['title'],
        description: params['description'],
        eventUrl: params['eventUrl'],
        hashTag: params['hashTag'],
        startedDate: params['startedDate'],
        startedAt: params['startedAt'],
        endedAt: params['endedAt'],
        updatedAt: params['updatedAt']
      });
      return event.save(function(err) {
        return callback(err, params);
      });
    };

    EventProvider.prototype.updateTweetNum = function(params, callback) {
      return Event.update({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }, {
        $inc: {
          tweetNum: 1
        }
      }, function(err) {
        return callback();
      });
    };

    EventProvider.prototype.removeByEventId = function(params, callback) {
      console.log("remove");
      return Event.remove({
        eventId: params['eventId']
      }, function(err, data) {
        return callback(err, data);
      });
    };

    EventProvider.prototype.clear = function(params, callback) {
      console.log("\nClearrrrrrrrrrrrrrrrrrrr!!!!!\n");
      return Event.remove({
        "$and": [
          {
            endedAt: {
              $lt: params['date']
            },
            tweetNum: {
              $lt: 10
            }
          }
        ]
      }, function(err) {
        return callback(null);
      });
    };

    return EventProvider;

  })();

  TweetProvider = (function() {
    function TweetProvider() {}

    TweetProvider.prototype.findInitByEventId = function(params, callback) {
      return Tweet.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).sort({
        tweetId: 1
      }).limit(params["numShow"]).exec(function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.findRestByEventId = function(params, callback) {
      return Tweet.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).sort({
        tweetId: 1
      }).skip(params["numSkip"] || 0).exec(function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.findNewByEventId = function(params, callback) {
      return Tweet.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId'],
            tweetIdStr: {
              $gt: params['tweetIdStr'] + ''
            }
          }
        ]
      }).sort({
        tweetId: 1
      }).exec(function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.findByEventId = function(params, callback) {
      return Tweet.find({
        eventId: params['eventId']
      }, function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.findByTweetId = function(params, callback) {
      return Tweet.find({
        tweetId: params['tweetId']
      }, function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.findByHashTag = function(params, callback) {
      return Tweet.find({
        hashTag: params['hashTag']
      }, function(err, data) {
        return callback(err, data);
      });
    };

    TweetProvider.prototype.countDuplicatedTweet = function(params, callback) {
      return Tweet.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).count().exec(function(err, num) {
        return callback(err, num);
      });
    };

    TweetProvider.prototype.save = function(params, callback) {
      var tweet;
      console.log("Twitter Go ----> MongoDB");
      tweet = new Tweet({
        serviceName: params['serviceName'],
        eventId: params['eventId'],
        tweetId: params['tweetId'],
        tweetIdStr: params['tweetIdStr'],
        text: params['text'],
        mediaUrl: params['mediaUrl'],
        displayUrl: params['displayUrl'],
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

  SlideProvider = (function() {
    function SlideProvider() {}

    SlideProvider.prototype.findSlidesByEventId = function(params, callback) {
      console.log("\n============> Slide findSlidesByEventId\n");
      return Slide.find({
        "$and": [
          {
            serviceName: params['serviceName'],
            eventId: params['eventId']
          }
        ]
      }).populate('tweet').sort({
        createdAt: -1
      }).exec(function(err, data) {
        return callback(err, data);
      });
    };

    SlideProvider.prototype.save = function(params, callback) {
      var slide;
      console.log("\n============> Slide save\n");
      console.log(params);
      slide = new Slide({
        tweetId: params['tweetId'],
        tweetIdStr: params['tweetIdStr'],
        url: params['url']
      });
      return slide.save(function(err, slide) {
        return callback(err, slide);
      });
    };

    return SlideProvider;

  })();

  exports.EventProvider = new EventProvider();

  exports.TweetProvider = new TweetProvider();

  exports.SlideProvider = new SlideProvider();

}).call(this);
