'use strict';

/* Directives */

angular.module('myApp.directives', [])
  .directive('imgPreload', ['$rootScope', function($rootScope) {
    return {
      restrict: 'A',
      scope: {
        ngSrc: '@'
      },
      link: function(scope, element, attrs) {
        element.on('load', function() {
          element.addClass('in');
        }).on('error', function() {
          //
        });
      }
    };
  }])
  .directive('slideable', function () {
    return {
      restrict:'C',
      compile: function (element, attr) {
        var contents = element.html();
        element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

        return function postLink(scope, element, attrs) {
          attrs.duration = (!attrs.duration) ? '0.4s' : attrs.duration;
          attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
          element.css({
            'overflow': 'hidden',
            'height': '0px',
            'transitionProperty': 'height',
            'transitionDuration': attrs.duration,
            'transitionTimingFunction': attrs.easing
          });
        };
      }
    };
  })
  .directive('slideToggle', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var target, content, tweetNumber;

        attrs.expanded = false;

        element.bind('click', function() {
          if (!target) target = document.querySelector(attrs.slideToggle);
          if (!content) content = target.querySelector('.slideable_content');
          if (!tweetNumber) tweetNumber = target.parentNode.querySelector('.tweet-number');

          if(!attrs.expanded) {
            content.style.border = '1px solid rgba(0,0,0,0)';
            var y = content.clientHeight;
            content.style.border = 0;
            tweetNumber.style.visibility = 'hidden';
            target.style.height = y + 'px';
          } else {
            tweetNumber.style.visibility = 'visible';
            target.style.height = '0px';
          }
          attrs.expanded = !attrs.expanded;
        });
      }
    }
  })
  .directive('timeago', function() {

    // Source: http://www.jonathanrowny.com/journal/timeago-directive-and-filter-angular-momentjs
    // <span timeago="{{someDate}}" />
    return {
      restrict:'A',
      link: function(scope, element, attrs){
        attrs.$observe("timeago", function(){
          element.text(moment(attrs.timeago).fromNow());
        });
      }
    };
  });
