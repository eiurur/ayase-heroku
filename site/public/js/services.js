'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
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
          "label": "100以上"
        , "num": 100
      }
    ];
  })
  .service('eventsStashService', function() {
    this.eventsStash = [];
  });