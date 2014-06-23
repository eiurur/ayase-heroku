var dir           = '../../data/lib/'
  , moment        = require('moment')
  , _             = require('underscore-node')
  , async         = require('async')
  , settings      = require(dir + 'settings')
  , my            = require(dir + 'my')
  , EventProvider = require(dir + 'model').EventProvider
  , TweetProvider = require(dir + 'model').TweetProvider
  ;

function tweetTrimer(t) {
  var tweet = t.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&amp;%@!&#45;\/]))?)/g,'<a href="$1" target="_blank">$1</a>');
  tweet = tweet.replace(/(^|\s)(@|＠)(\w+)/g,'$1<a href="http://www.twitter.com/$3" target="_blank">@$3</a>');
  return tweet.replace(/(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_/>]+)[#＃]([ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)/ig, ' <a href="http://twitter.com/search?q=%23$1" target="_blank">#$1</a>');
}

exports.readEventStartedAtDesc = function (req, res) {

    var  dataCount = 0
      ,  numShow   = 1000
      ;

    // 該当日(correspondDate)の中から、投稿日が新しい順に10件だけ取得
    EventProvider.findStartedAtDesc({
      numShow: numShow
    }, function(error, eventDatas) {
      var events = [];
      eventDatas.forEach(function (eventData) {
        events.push({
             eventId: eventData.eventId
          ,  title: eventData.title
          ,  catch: eventData.catch
          ,  description: eventData.description
          ,  eventUrl: eventData.eventUrl
          ,  hashTag: eventData.hashTag
          ,  startedDate: eventData.startedDate
          ,  startedDateX: moment(eventData.startedDate).format("X")
          ,  startedAt: moment(eventData.startedAt).format("YYYY/MM/DD HH:mm")
          ,  endedAt: moment(eventData.endedAt).format("HH:mm")
          ,  series: eventData.series
          ,  ownerId: eventData.ownerId
          ,  ownerNickname: eventData.ownerNickname
          ,  ownerDisplayName: eventData.ownerDisplayName
          ,  updatedAt: moment(eventData.updatedAt).format("YYYY-MM-DD HH:mm")
          ,  tweetNum: eventData.tweetNum
        });
      });

      res.json({
          events: events
      });
    });
};

exports.readEventByEventId = function (req, res) {

    var eventId   = req.params.eventId
      , numShow   = 1
      ;

    console.log("readEventByEventId eventId = " + eventId);

    // 該当日(correspondDate)の中から、投稿日が新しい順に10件だけ取得
    EventProvider.findByEventId({
        eventId: eventId
      , numShow: numShow
    }, function(error, eventDatas) {
      var events = [];
      eventDatas.forEach(function (eventData) {
        events.push({
             eventId: eventData.eventId
          ,  title: eventData.title
          ,  catch: eventData.catch
          ,  description: eventData.description
          ,  eventUrl: eventData.eventUrl
          ,  hashTag: eventData.hashTag
          ,  startedDate: moment(eventData.startedDate).format("YYYY年 MM月 DD日")
          ,  startedDateX: moment(eventData.startedDate).format("X")
          ,  startedAt: moment(eventData.startedAt).format("YYYY/MM/DD HH:mm")
          ,  endedAt: moment(eventData.endedAt).format("HH:mm")
          ,  series: eventData.series
          ,  ownerId: eventData.ownerId
          ,  ownerNickname: eventData.ownerNickname
          ,  ownerDisplayName: eventData.ownerDisplayName
          ,  updatedAt: moment(eventData.updatedAt).format("YYYY-MM-DD HH:mm")
          ,  tweetNum: eventData.tweetNum
        });
      });

      console.log("events = ", events);

      res.json({
          events: events
      });
    });
};

exports.readTweet = function (req, res) {

    var eventId   = req.params.eventId
      , dataCount = 0
      , numShow   = 100
      ;

    console.log("readTweet eventId = " + eventId);

    TweetProvider.findByEventId({
      eventId: eventId
    }, function(error, tweetDatas) {
      var tweets = [];

      if(_.isEmpty(tweetDatas)) {
        console.log("tweetDatas ", tweetDatas);
        return;
      }

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

      res.json({
          tweets: tweets
      });
    });
};
