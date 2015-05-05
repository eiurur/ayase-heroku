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
  .directive('accordion', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var target, content, tweetNumber;

        attrs.expanded = false;

        element.bind('click', function() {
          if (!target) target = document.querySelector(attrs.accordion);
          if (!content) content = target.querySelector('.slideable_content');

          if(!attrs.expanded) {
            content.style.border = '1px solid rgba(0,0,0,0)';
            var y = content.clientHeight;
            content.style.border = 0;
            target.style.height = y + 'px';
          } else {
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
  })
  .directive("stickyNav", ['$window', function stickyNav($window){
    function stickyNavLink(scope, element){
      var w = angular.element($window),
          size = element[0].clientHeight,
          top = 0;

      /*
       * on scroll we just check the page offset
       * if it's bigger than the target size we fix the controls
       * otherwise we display them inline
       */
      function toggleStickyNav(){
        if(!element.hasClass('slide__panel-affix') && $window.pageYOffset > top + size){
          element.addClass('slide__panel-affix');
        } else if(element.hasClass('slide__panel-affix') && $window.pageYOffset <= top + size){
          element.removeClass('slide__panel-affix');
        }
      }

      /*
       * We update the top position -> this is for initial page load,
       * while elements load
       */
      scope.$watch(function(){
        return element[0].getBoundingClientRect().top + $window.pageYOffset;
      }, function(newValue, oldValue){
        if(newValue !== oldValue && !element.hasClass('slide__panel-affix')){
          top = newValue;
        }
      });

      /*
       * Resizing the window displays the controls inline by default.
       * This is needed to calculate the correct boundingClientRect.
       * After the top is updated we toggle the nav, eventually
       * fixing the controls again if needed.
       */
      w.bind('resize', function stickyNavResize(){
        element.removeClass('slide__panel-affix');
        top = element[0].getBoundingClientRect().top + $window.pageYOffset;
        toggleStickyNav();
      });
      w.bind('scroll', toggleStickyNav);
    }

    return {
      scope: {},
      restrict: 'A',
      link: stickyNavLink
    };
  }]);