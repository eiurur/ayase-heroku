(function() {
  var EventProvider, Tweet, TweetProvider, _, exception, model, moment, my, s,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-node');

  moment = require('moment');

  exception = require('./exception');

  my = require('./my').my;

  model = require('./model');

  EventProvider = model.EventProvider;

  TweetProvider = model.TweetProvider;

  s = process.env.NODE_ENV === "production" ? require("./production") : require("./development");

  Tweet = (function() {
    function Tweet(data1, eventStartAndEndTime) {
      this.data = data1;
      this.eventStartAndEndTime = eventStartAndEndTime;
      this.assign = bind(this.assign, this);
      this.eventData = void 0;
      this.tweetTime = void 0;
      this.collectionBeginningTime = void 0;
      this.collectionClosingTime = void 0;
    }

    Tweet.prototype.assign = function() {

      /*
      ハッシュタグが複数含まれている場合を考慮し、ループでハッシュタグの存在チェック
      
      MEMO: 6/10
      Twitter Straming APIは大文字小文字を区別せずに収集するため、
      イベントのハッシュタグが#swiftだと、#Swiftを含むツイートまで補足するが、
      JavaScriptでは別物とみなし、結果として undefiendが返され、そこで処理が終わる。
       */
      return this.data.entities.hashtags.forEach((function(_this) {
        return function(val) {

          /*
          forEachはツイートに含まれるすべてのハッシュタグをチェックするため
          「テスト投稿 #ok #ng」だと
          初めに#okと一致するイベントデータを@eventDataに代入するも、
          ループはそこで終わらず、#ngも_.findWhereで存在確認を行ってしまい、
          結果的に@eventData には Undeifnedが上書きされる。
          その回避策としてundefiendでなければループを抜け出す(continue)処理を追記
           */
          if (!_.isUndefined(_this.eventData)) {
            return;
          }
          return _this.eventData = _.findWhere(_this.eventStartAndEndTime, {
            hashTag: "#" + val.text
          });
        };
      })(this));
    };

    Tweet.prototype.isDomesticTweet = function() {
      my.c("ツイートの発生国", this.data.user.lang);
      my.c("ツイートの言語 ", this.data.lang);
      if (this.data.user.lang === "ja" || this.data.lang === "ja") {
        return true;
      } else {
        return false;
      }
    };

    Tweet.prototype.isNgTweet = function() {
      var ng_tweet_keyword_pattern;
      ng_tweet_keyword_pattern = new RegExp("(" + (s.NG_TWEET_KEYWORDS.join('|')) + ")", 'gmi');
      if (ng_tweet_keyword_pattern.test(this.data.text)) {
        throw new exception.NGTweetException();
      }
    };

    Tweet.prototype.isNgUser = function() {

      /*
      RTはまとめない仕様なので　@data.retweeted.user.screen_name もチェックする必要はなく
      下の処理だけでよい。
       */
      if (_.contains(s.NG_USERS, this.data.user.screen_name)) {
        throw new exception.NGUserException();
      }
    };

    Tweet.prototype.formatTweetTime = function() {
      return this.tweetTime = my.formatYMDHms(this.data.created_at);
    };

    Tweet.prototype.subHours = function() {
      return my.addHoursFormatYMDHms(-s.ALLOWED_HOURS, this.eventData.startedAt);
    };

    Tweet.prototype.addHours = function() {
      return my.addHoursFormatYMDHms(s.ALLOWED_HOURS, this.eventData.endedAt);
    };

    Tweet.prototype.tweetDubug = function() {
      my.c("ツイート時刻", this.tweetTime);
      my.c("収集開始時刻(イベント開始時刻 - " + s.ALLOWED_HOURS + ")", this.collectionBeginningTime);
      my.c("収集終了時刻(イベント開始時刻 + " + s.ALLOWED_HOURS + ")", this.collectionClosingTime);
      my.c("ツイート者", this.data.user.screen_name);
      my.c("ツイート内容", this.data.text);
      return my.c(" ↓ ");
    };

    Tweet.prototype.isInTime = function() {
      var ref;
      this.collectionBeginningTime = this.subHours();
      this.collectionClosingTime = this.addHours();
      this.tweetDubug();
      if ((this.collectionBeginningTime <= (ref = this.tweetTime) && ref <= this.collectionClosingTime)) {
        my.c("\n(≧▽≦) < 保存します！！！！！！！！！！！！！！！！！！\n");
        return true;
      }
      my.c("\n ヾ(｡>﹏<｡)ﾉﾞ✧*。 < 時間切れですー");
      return false;
    };

    Tweet.prototype.check = function() {
      if (this.isInTime()) {
        this.restoreUrl();
      } else {
        return;
      }
      return this.insertTweetData();
    };

    Tweet.prototype.isDuplicatedTweet = function() {
      my.c("middle isDuplicatedTweet");
      my.c("RT text", this.data.retweeted_status.text);
      return TweetProvider.countDuplicatedTweet({
        serviceName: this.eventData.serviceName,
        tweetId: this.data.retweeted_status.id
      }, function(error, num) {
        my.c("重複したツイートです。いわゆるRT？　(๑•﹏•) < 重複の数は", num);
        if (num === 0) {
          return this.check();
        }
      });
    };

    Tweet.prototype.isRetweeted = function() {
      if (_.has(this.data, 'retweeted_status')) {
        return true;
      } else {
        return false;
      }
    };

    Tweet.prototype.incrementTweetNum = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return EventProvider.updateTweetNum({
            serviceName: _this.eventData.serviceName,
            eventId: _this.eventData.eventId
          }, function(error) {
            if (error) {
              return reject(error);
            }
            my.c("updateTweetNum!!!");
            return resolve("");
          });
        };
      })(this));
    };

    Tweet.prototype.isOverNumTweet = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return EventProvider.findByEventId({
            serviceName: _this.eventData.serviceName,
            eventId: _this.eventData.eventId
          }, function(error, data) {
            if (data[0].tweetNum !== 50) {
              return reject(data[0].tweetNum);
            }
            my.c("n2T ===> " + _this.eventData.serviceName + "/" + _this.eventData.eventId);
            return resolve(data[0]);
          });
        };
      })(this));
    };

    Tweet.prototype.tweet = function(event) {
      return s.twitter.verifyCredentials(function(err, data) {
        return console.log(data);
      }).updateStatus(event.title + " " + s.SITE_URL + "/detail/" + event.serviceName + "/" + event.eventId + " #" + event.hashTag, function(err, data) {
        return console.log(data);
      });
    };

    Tweet.prototype.notify2Twitter = function() {
      return this.isOverNumTweet().then((function(_this) {
        return function(event) {
          return _this.tweet(event)();
        };
      })(this))["catch"](function(tweetNum) {
        return console.log("まだですー : " + tweetNum + "ツイート");
      });
    };

    Tweet.prototype.hasMediaProperty = function() {
      console.log(this.data.entities);
      return _.has(this.data.entities, 'media');
    };

    Tweet.prototype.insertTweetData = function() {
      var _eventId, params;
      _eventId = this.eventData.eventId;
      params = {
        serviceName: this.eventData.serviceName,
        eventId: this.eventData.eventId,
        tweetId: this.data.id,
        tweetIdStr: this.data.id_str,
        text: this.data.text,
        mediaUrl: null,
        displayUrl: null,
        hashTag: this.eventData.hashTag,
        createdAt: this.tweetTime,
        userId: this.data.user.id,
        userName: this.data.user.name,
        screenName: this.data.user.screen_name,
        profileImageUrl: this.data.user.profile_image_url
      };
      if (this.hasMediaProperty()) {
        console.log('aaa');
        params.mediaUrl = this.data.entities.media[0].media_url;
        params.displayUrl = this.data.entities.media[0].display_url;
      }
      return TweetProvider.save(params, (function(_this) {
        return function(error, data) {
          if (error) {
            my.c('error insertTweetData: ', error);
            return;
          }

          /*
          ツイートの一覧をページに表示するときの手がかりがない
          -> ツイート回数が0以上なら表示ってことにしたい。
          -> それ用に、Eventsに"tweetNum"を追加
          -> tweetNumをインクリメントするための処理をここで行う
           */
          return _this.incrementTweetNum().then(function(data) {
            return _this.notify2Twitter();
          })["catch"](function(error) {
            return my.c("@incrementTweetNum error: ", error);
          });
        };
      })(this));
    };

    Tweet.prototype.restoreUrl = function() {
      return this.data.entities.urls.forEach((function(_this) {
        return function(val) {
          _this.data.text = _this.data.text.replace(val.url, val.expanded_url);
          my.c("結果 in restoreUrl", _this.data.text);
          my.c("val.url in restoreUrl", val.url);
          return my.c("val.expanded_url in restoreUrl", val.expanded_url);
        };
      })(this));
    };

    Tweet.prototype.debugInAggregate = function() {
      my.c("\n--------------------------------------------------------------");
      my.c("tweet     -> ", this.data.text);
      return my.c("hasttags  -> ", this.data.hashtags);
    };

    Tweet.prototype.dump = function() {
      return my.dump(this.data);
    };

    return Tweet;

  })();

  exports.Tweet = Tweet;

}).call(this);
