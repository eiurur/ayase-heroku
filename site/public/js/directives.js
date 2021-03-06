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
      var w            = angular.element($window),
          size         = element[0].clientHeight,
          footerHeight = 186, // .slide__panel-affix-bottomのbottomの値(footerのHeight)
          top          = 0;

      /*
       * on scroll we just check the page offset
       * if it's bigger than the target size we fix the controls
       * otherwise we display them inline
       */
      function toggleStickyNav(){
        var pageYOffset = $window.pageYOffset;  // ページ上部からスクロールした長さ(一番上なら0)
        var scrollHeight = document.body.scrollHeight; // スクロールできるページ全体の長さ

        // 上から距離を元にStickyするかどうかの判定
        if(!element.hasClass('slide__panel-affix') && pageYOffset > top){
          element.addClass('slide__panel-affix');
        } else if(element.hasClass('slide__panel-affix') && pageYOffset <= top){
          element.removeClass('slide__panel-affix');
        }

        // 下からの距離を元に'slide__panel-affix-bottom'を付与するかどうかの判定
        if(!element.hasClass('slide__panel-affix-bottom') && pageYOffset + size + footerHeight > scrollHeight){
          element.addClass('slide__panel-affix-bottom');
        } else if(element.hasClass('slide__panel-affix-bottom') &&　pageYOffset + size + footerHeight <= scrollHeight){
          element.removeClass('slide__panel-affix-bottom');
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
  }])
  .directive("zoomImage", ["$rootScope", function($rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var html;
        html = '';
        element.on('mouseenter', function() {
          var imageLayer;
          imageLayer = angular.element(document).find('.image-layer');
          html = "<img\n  src=\"" + attrs.imgSrc + ":orig\"\n  class=\"image-layer__img image-layer__img--hidden\" />";
          return imageLayer.html(html);
        });
        return element.on('click', function() {
          var cH, cH_cW_percent, cW, dirction, h, h_w_percent, imageLayer, imageLayerImg, w;
          html = angular.element(document).find('html');
          imageLayer = angular.element(document).find('.image-layer');
          imageLayer.addClass('image-layer__overlay');
          imageLayerImg = angular.element(document).find('.image-layer__img');
          imageLayerImg.removeClass('image-layer__img--hidden');
          if (imageLayerImg[0].naturalHeight == null) {
            return;
          }
          h = imageLayerImg[0].naturalHeight;
          w = imageLayerImg[0].naturalWidth;
          dirction = h > w ? 'h' : 'w';
          console.log(h, w);
          h_w_percent = h / w * 100;
          if ((50 < h_w_percent && h_w_percent < 75)) {
            console.log('横長', h_w_percent);
            dirction = 'w';
          } else if ((100 <= h_w_percent && h_w_percent < 125)) {
            console.log('縦長', h_w_percent);
            dirction = 'h';
          }
          cH = html[0].clientHeight;
          cW = html[0].clientWidth;
          cH_cW_percent = cH / cW * 100;
          console.log('cH_cW_percent = ', cH_cW_percent);
          if (cH_cW_percent < 75) {
            console.log('c 横長', cH_cW_percent);
            dirction = 'h';
          } else if (125 < cH_cW_percent) {
            console.log('c 縦長', cH_cW_percent);
            dirction = 'w';
          }
          imageLayerImg.addClass("image-layer__img-" + dirction + "-wide");
          return imageLayer.on('click', function() {
            imageLayer.html('');
            return imageLayer.removeClass('image-layer__overlay');
          });
        });
      }
    };
  }]).directive("scrollOnClick", function() {
    return {
      restrict: "A",
      scope: {
        scrollTo: "@"
      },
      link: function(scope, element, attrs) {
        return element.on('click', function() {
          return $('html, body').animate({
            scrollTop: $(scope.scrollTo).offset().top
          }, "slow");
        });
      }
    };
  });