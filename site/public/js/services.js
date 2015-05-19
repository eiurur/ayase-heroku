'use strict';

/* Services */

angular.module('myApp.services', [])
  .service('termsService', function() {
    this.terms = [
      {
          "label": "一週間以内"
        , "time": moment().subtract(1, 'weeks').format("X")
      },
      {
          "label": "一か月以内"
        , "time": moment().subtract(1, 'months').format("X")
      },
      {
          "label": "半年以内"
        , "time": moment().subtract(6, 'months').format("X")
      },
      {
          "label": "一年以内"
        , "time": moment().subtract(12, 'months').format("X")
      },
      {
          "label": "全期間"
        , "time": 0
      }
    ];
  })
  .service('tweetsNumService', function() {
    this.tweetsNum = [
      {
          "label": "全て"
        , "num": 0
      },
      {
          "label": "10件以上"
        , "num": 10
      },
      {
          "label": "50件以上"
        , "num": 50
      },
      {
          "label": "100件以上"
        , "num": 100
      }
    ];
  })
  .service('eventsStashService', function() {
    this.eventsStash = [];
  })
  .service('ArticleService', function() {
    this.datas = [];
    this.numLoaded = 1;
  })
  .service('TweetService', function() {
    return {
      getExpandedURLFromURL: function(entities) {
        if (!_.has(entities, 'url')) { return ''; }
        return entities.url.urls;
      },

      getExpandedURLFromDescription: function(entities) {
        if (!_.has(entities, 'description')) { return ''; }
        if (!_.has(entities.description, 'urls')) { return ''; }
        return entities.description.urls;
      }
    }
  })
  .service('EventService', function($http) {
    return {
      getOnTheDay: function() {
        return $http.get('/api/readEventOnTheDay/');
      },

      getInit: function() {
        return $http.get('/api/readInitEvent/');
      },

      getAll: function() {
        return $http.get('/api/readAllEvent/');
      },

      getMore: function(numLoaded) {
        return $http.get('/api/readMoreEvent/' + numLoaded);
      },

      getByServiceNameAndId: function(serviceName, eventId) {
        return $http.get('/api/readEventByEventId/' + serviceName + '/' + eventId);
      }
    };
  })
  .factory('SlideService', function($http) {
    return {
      getEmbedCode: function(params) {
        return $http.post('/api/getEmbedCode', params);
      },

      getSlideId: function(params) {
        return $http.post('/api/getSlideId', params);
      },

      slideshare_pattern: /"((http|https):\/\/www.slideshare.net\/[0-9a-zA-Z\/-]*)"\s/im,

      speakerdeck_pattern: /"((http|https):\/\/speakerdeck.com\/[0-9a-zA-Z\/-]*)"\s/im
    };

  });