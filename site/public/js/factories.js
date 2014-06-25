'use strict';

/* Factory */

angular.module('myApp.factories', [])
  .factory('Page', function() {
    var title = 'Ayase';
    return {
      title: function() { return title; },
      setTitle: function(newTitle) { title = newTitle; }
    };
  });