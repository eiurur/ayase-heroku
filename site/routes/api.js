var dir                         = '../../data/lib/'
  , moment                      = require('moment')
  , _                           = require('underscore-node')
  , async                       = require('async')
  , my                          = require(dir + 'my')
  , EventProvider               = require(dir + 'model').EventProvider
  , TweetProvider               = require(dir + 'model').TweetProvider
  , settings                    = process.env.NODE_ENV === 'production' ? require(dir + 'production') : require(dir + 'development')
  , INIT_GET_BORDER_NUMBER_LINE = 10
  ;

function tweetTrimer(t) {
  var tweet = t.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&amp;%@!&#45;\/]))?)/g,'<a href="$1" target="_blank">$1</a>');
  tweet = tweet.replace(/(^|\s)(@|＠)(\w+)/g,'$1<a href="http://www.twitter.com/$3" target="_blank">@$3</a>');
  return tweet.replace(/(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_/>]+)[#＃]([ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)/ig, ' <a href="http://twitter.com/search?q=%23$1" target="_blank">#$1</a>');
}


exports.readInitEvent = function (req, res) {

    var numShow = INIT_GET_BORDER_NUMBER_LINE;

    EventProvider.findInit({
        numShow: numShow
    }, function(error, eventDatas) {
      var events = [];
      eventDatas.forEach(function (eventData) {
        events.push({
             serviceName: eventData.serviceName
          ,  eventId: eventData.eventId
          ,  title: eventData.title
          ,  description: eventData.description
          ,  eventUrl: eventData.eventUrl
          ,  hashTag: eventData.hashTag
          ,  startedDate: moment(eventData.startedDate).format('YYYY-MM-DD')
          ,  startedDateX: moment(eventData.startedDate).format("X")
          ,  startedAt: moment(eventData.startedAt).format("YYYY/MM/DD HH:mm")
          ,  endedAt: moment(eventData.endedAt).format("HH:mm")
          ,  tweetNum: eventData.tweetNum
        });
      });

      console.log("------ initEvent ------");
      console.log(events.length);

      res.json({
          events: events
      });
    });
};


exports.readAllEvent = function (req, res) {

    EventProvider.findAll({
    }, function(error, eventDatas) {
      var events = [];
      eventDatas.forEach(function (eventData) {
        events.push({
             serviceName: eventData.serviceName
          ,  eventId: eventData.eventId
          ,  title: eventData.title
          ,  description: eventData.description
          ,  eventUrl: eventData.eventUrl
          ,  hashTag: eventData.hashTag
          ,  startedDate: moment(eventData.startedDate).format('YYYY-MM-DD')
          ,  startedDateX: moment(eventData.startedDate).format("X")
          ,  startedAt: moment(eventData.startedAt).format("YYYY/MM/DD HH:mm")
          ,  endedAt: moment(eventData.endedAt).format("HH:mm")
          ,  tweetNum: eventData.tweetNum
        });
      });

      console.log("------ restEvent ------");
      console.log(events.length);

      res.json({
          events: events
      });
    });
};


// 当日開催するイベントをDBから取得する。
exports.readEventOnTheDay = function (req, res) {

    var numShow = 30;

    // 当日開催するイベントのデータを取得
    EventProvider.findOnTheDay({
        numShow: numShow
      , nowDate: moment().format('YYYY-MM-DD')
    }, function(error, eventDatas) {
      var eventsOnTheDay = [];
      eventDatas.forEach(function (eventData) {
        eventsOnTheDay.push({
             serviceName: eventData.serviceName
          ,  eventId: eventData.eventId
          ,  title: eventData.title
          ,  description: eventData.description
          ,  eventUrl: eventData.eventUrl
          ,  hashTag: eventData.hashTag
          ,  startedDate: moment(eventData.startedDate).format('YYYY-MM-DD')
          ,  tweetNum: eventData.tweetNum
        });
      });

      res.json({
          eventsOnTheDay: eventsOnTheDay
      });
    });
};


// イベントに関するツイート一覧表示画面で、そのイベントの詳細情報をDBから取得するためのAPI
exports.readEventByEventId = function (req, res) {

    var serviceName = req.params.serviceName
      , eventId     = req.params.eventId
      , numShow     = 1
      ;

    console.log("readEventByEventId serviceName = " + serviceName);
    console.log("readEventByEventId eventId = " + eventId);

    EventProvider.findByEventId({
        serviceName: serviceName
      , eventId: eventId
      , numShow: numShow
    }, function(error, eventDatas) {
      var events = [];

      if(_.isNull(error)) {
        eventDatas.forEach(function (eventData) {
          events.push({
               serviceName: eventData.serviceName
            ,  eventId: eventData.eventId
            ,  title: eventData.title
            ,  description: eventData.description
            ,  eventUrl: eventData.eventUrl
            ,  hashTag: eventData.hashTag
            ,  startedDate: moment(eventData.startedDate).format("YYYY年 MM月 DD日")
            ,  startedDateX: moment(eventData.startedDate).format("X")
            ,  startedAt: moment(eventData.startedAt).format("YYYY/MM/DD HH:mm")
            ,  endedAt: moment(eventData.endedAt).format("HH:mm")
            ,  tweetNum: eventData.tweetNum
          });
        });
      }

      console.log("events = ", events);

      res.json({
          events: events
      });
    });
};


// 最初の20件分のツイートをDBから取得してViewに渡す
exports.readTweet = function (req, res) {

    var serviceName = req.params.serviceName
      , eventId     = req.params.eventId
      , numShow     = INIT_GET_BORDER_NUMBER_LINE
      ;

    TweetProvider.findInitByEventId({
        serviceName: serviceName
      , eventId: eventId
      , numShow: numShow
    }, function(error, tweetDatas) {
      var tweets = [];

      if(_.isNull(error)) {
        tweetDatas.forEach(function (tweetData) {
          tweets.push({
               eventId: tweetData.eventId
            ,  tweetId: tweetData.tweetId
            ,  tweetIdStr: tweetData.tweetIdStr
            ,  text: tweetTrimer(tweetData.text)
            ,  hashTag: tweetData.hashTag
            ,  tweetUrl: tweetData.tweetUrl
            ,  hashTag: tweetData.hashTag
            ,  createdAt: moment(tweetData.createdAt).format("YYYY-MM-DD HH:mm:ss")
            ,  userId: tweetData.userId
            ,  userName: tweetData.userName
            ,  screenName: tweetData.screenName
            ,  profileImageUrl: tweetData.profileImageUrl
          });
        });
      }

      res.json({
          tweets: tweets
      });
    });
};


// 20件以降の残りのツイートをDBから取得してViewに渡す
exports.readRestTweet = function (req, res) {

    var serviceName = req.params.serviceName
      , eventId     = req.params.eventId
      , numSkip     = INIT_GET_BORDER_NUMBER_LINE
      ;

    TweetProvider.findRestByEventId({
        serviceName: serviceName
      , eventId: eventId
      , numSkip: numSkip
    }, function(error, tweetDatas) {
      var tweets = [];

      if(_.isNull(error)) {
        tweetDatas.forEach(function (tweetData) {
          tweets.push({
               eventId: tweetData.eventId
            ,  tweetId: tweetData.tweetId
            ,  tweetIdStr: tweetData.tweetIdStr
            ,  text: tweetTrimer(tweetData.text)
            ,  hashTag: tweetData.hashTag
            ,  tweetUrl: tweetData.tweetUrl
            ,  hashTag: tweetData.hashTag
            ,  createdAt: moment(tweetData.createdAt).format("YYYY-MM-DD HH:mm:ss")
            ,  userId: tweetData.userId
            ,  userName: tweetData.userName
            ,  screenName: tweetData.screenName
            ,  profileImageUrl: tweetData.profileImageUrl
          });
        });
      }

      res.json({
          tweets: tweets
      });
    });
};


// 最初の20件分のツイートをDBから取得してViewに渡す
exports.readNewTweet = function (req, res) {

    var serviceName = req.params.serviceName
      , eventId     = req.params.eventId
      , tweetIdStr  = req.params.tweetIdStr
      ;

    TweetProvider.findNewByEventId({
        serviceName: serviceName
      , eventId: eventId
      , tweetIdStr: tweetIdStr
    }, function(error, tweetDatas) {
      var tweets = [];

      if(_.isNull(error)) {
        tweetDatas.forEach(function (tweetData) {
          tweets.push({
               eventId: tweetData.eventId
            ,  tweetId: tweetData.tweetId
            ,  tweetIdStr: tweetData.tweetIdStr
            ,  text: tweetTrimer(tweetData.text)
            ,  hashTag: tweetData.hashTag
            ,  tweetUrl: tweetData.tweetUrl
            ,  hashTag: tweetData.hashTag
            ,  createdAt: moment(tweetData.createdAt).format("YYYY-MM-DD HH:mm:ss")
            ,  userId: tweetData.userId
            ,  userName: tweetData.userName
            ,  screenName: tweetData.screenName
            ,  profileImageUrl: tweetData.profileImageUrl
          });
        });
      }

      res.json({
          tweets: tweets
      });
    });
};
