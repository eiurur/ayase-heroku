'use strict';

/* Factory */

angular.module('myApp.factories', [])
  .factory('Page', function() {

    var title = 'Ayase';
    return {
      title: function() { return title; },
      setTitle: function(newTitle) { title = newTitle; }
    };

  })
  .factory('Event', function($http, ArticleService, EventService) {

    var Event = function() {

      (function() {
        this.items = ArticleService.datas;
      }).call(this);

      this.busy = false;

      if(_.isEmpty(this.items)) {
        EventService.getInit().
          success(function(data) {
            this.items = data.events;
          }.bind(this));
      }

      // 当日開催するイベントの一覧を取得
      EventService.getOnTheDay().
        success(function(data) {
          if(data.eventsOnTheDay.length　=== 0){
            this.eventsOnTheDay =[{
                title: "開催予定のイベントはありません"
              , eventUrl: "#"
            }];
          } else {
            this.eventsOnTheDay = data.eventsOnTheDay;
          }
        }.bind(this));

    };

    Event.prototype.nextPage = function() {

      if (this.busy) return;
      this.busy = true;

      (function() {
        EventService.getMore(ArticleService.numLoaded)
          .success(function(data) {
            this.items = this.items.concat(data.events);

            // 現在の読み込みページ数？を増やす
            ArticleService.numLoaded += 1;

            // 読み込み済みページ数と、記事を更新
            ArticleService.datas = this.items;

            this.busy = false;
          }.bind(this));
      }).call(this);

    };

    return Event;

  })
  .factory('Tweet', function($http) {

    return {
      getInit : function(serviceName, eventId) {
        return $http.get('/api/readTweet/' + serviceName + '/' + eventId);
      },

      getRest: function(serviceName, eventId) {
        return $http.get('/api/readRestTweet/' + serviceName + '/' + eventId);
      },

      getNew: function(serviceName, eventId, lastTweetIdStr) {
        return $http.get('/api/readNewTweet/' + serviceName + '/' + eventId + '/' + lastTweetIdStr);
      }
    };

  });