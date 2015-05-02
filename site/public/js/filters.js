'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('tweetTrimer', function ($sce) {
        return function(text) {
            if ( !text ){return;}
            var tweet = text.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&amp;%@!&#45;\/]))?)/,'<a href="$1" target="_blank">$1</a>');
            tweet = tweet.replace(/(^|\s)(@|＠)(\w+)/g,'$1<a href="http://www.twitter.com/$3" target="_blank">@$3</a>');
            tweet = tweet.replace(/(^|\s)#(\w+)/g, '$1<a href="http://search.twitter.com/search?q=%23$2" target="_blank">#$2</a>');
            return $sce.trustAsHtml(tweet);
        };
  })
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })
  .filter('extractionTime', function() {
    return function(items, term) {
      var result = [];
      angular.forEach(items, function(item) {
        if(item.startedDateX >= term) {
          result.push(item);
        }
      });
      return result;
    }
  })
  .filter('extractionTweetNum', function() {
    return function(items, num) {
      var result = [];
      angular.forEach(items, function(item) {
        if(item.tweetNum >= num) {
          result.push(item);
        }
      });
      return result;
    }
  })
  .filter('timeago', function(){
    return function(date){
      return moment(date).fromNow();
    };
  })
  .filter('extractionOnTheDay', function(){
    var nowDate = moment().format('YYYY-MM-DD');
    return function(items) {
      var result = [];
      angular.forEach(items, function(item) {
        if(item.startedDate === nowDate) {
          result.push(item);
        }
      });
      return result;
    }
  })
  .filter('trusted', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
  }]);