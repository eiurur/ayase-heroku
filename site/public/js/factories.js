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
  .factory('Event', function($http) {

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

      getByServiceNameAndId: function(serviceName, eventId) {
        return $http.get('/api/readEventByEventId/' + serviceName + '/' + eventId);
      }
    };

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