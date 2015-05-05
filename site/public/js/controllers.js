function IndexCtrl($scope, $http, $rootScope, $timeout, termsService, tweetsNumService, Page, Event) {

  $scope.events = new Event();

  Page.setTitle("Ayase");
  $rootScope.title = Page.title();

  $scope.terms = termsService.terms;
  $scope.selectedTerm = $scope.terms[3];

  $scope.tweetsNum = tweetsNumService.tweetsNum;
  $scope.selectedTweetNum = $scope.tweetsNum[0];

}

function DetailCtrl($scope, $http, $rootScope, $routeParams, $location, $timeout, $interval, EventService, SlideService, Page, Tweet) {

  /**
   * ページ描画時に最初に行う処理
   */
  var lastTweetIdStr
    , serviceName = $routeParams.serviceName || "connpass"
    , eventId     = $routeParams.eventId || 0
    ;

  $scope.slides = [];

  /**
   * イベントの情報を取得
   */
  EventService.getByServiceNameAndId(serviceName, eventId).
    success(function(data) {
      $scope.events = data.events;
      Page.setTitle($scope.events[0].title);
      $rootScope.title = Page.title();
    });

  /**
   * ツイートを取得
   */
  Tweet.getInit(serviceName, eventId).
    success(function(data) {
      var tweetLength = data.tweets.length;

      $scope.tweets = data.tweets;

      // URLから無効なページへ直接アクセスされたときはindexページへリダイレクト
      if(tweetLength === 0) {
        console.log("No tweets");
        $location.path('/');
      }

      // DBへ無駄なクエリは投げない
      if(tweetLength < 10) {
        console.log(tweetLength);
        return;
      }

      // 残りのツイートを取得
      Tweet.getRest(serviceName, eventId).
        success(function(data) {
          IterateTweets(data);
        });

      // イベントが終了して4時間経っているなら新規ツイートはViewに反映させない。
      var nowTimeYMDHm = moment().format("YYYY-MM-DD HH:mm");
      var after4hFromEndedAt = moment(new Date($scope.events[0].endedAtYMDHm)).add('h', '4').format("YYYY-MM-DD HH:mm:ss");
      if(nowTimeYMDHm > after4hFromEndedAt) return;
      getNewTweetInterval();
    });

  // シェアボタンのURL割り当て用
  $scope.absUrl = $location.absUrl();

  // ツイート一覧の並び順をtweetIDで昇順に変更。
  $scope.reverse = false;


  function insertTweetViewList(data, index) {
    // $scope.tweets.push(data.tweets[index]); より高速
    $scope.tweets[$scope.tweets.length] = data.tweets[index];
    lastTweetIdStr = data.tweets[index].tweetIdStr;
  }

  function insertSlideViewList(data, index) {
    // TODO: 同じ処理は関数化

    // 正規表現を使ってスライドURLが含まれているか
    isIncludeSlideShareUrl = data.tweets[index].text.indexOf("www.slideshare.net");
    if(isIncludeSlideShareUrl !== -1) {

      // 正規表現に一致しなかった場合はnullが返ってくる。
      // エラー分岐をさせないと、nullに[1]なんてねーよって怒られるからそれ用の措置。
      var resultExec = SlideService.slideshare_pattern.exec(data.tweets[index].text);
      if(_.isNull(resultExec)) return;

      var slideUrl = resultExec[1];

      // すでに一覧に表示されているスライドは表示させない
      var sameSlide = _.findWhere($scope.slides, {url: slideUrl});
      if(!_.isUndefined(sameSlide)) return;

      (function() {
        SlideService.getSlideId({url: slideUrl, serviceName: 'slideshare'})
        .success(function(slide) {

          // スライドが削除されていたら空のオブジェクトが返る。それは一覧に表示させない
          if(_.isEmpty(slide)) return;

          $scope.slides.push({
              serviceName: 'slideshare'
            , id: slide.slideId
            , url: slideUrl
            , enbedCode: '//www.slideshare.net/slideshow/embed_code/key/' + slide.slideId
            , tweet: data.tweets[index]
          });
        });
      })();
    }

    isIncludeSpeakerDeckUrl = data.tweets[index].text.indexOf("speakerdeck.com");
    if(isIncludeSpeakerDeckUrl !== -1) {

      var resultExec = SlideService.speakerdeck_pattern.exec(data.tweets[index].text);
      if(_.isNull(resultExec)) return;
      var slideUrl = resultExec[1];

      // すでに一覧に表示されているスライドは表示させない
      var sameSlide = _.findWhere($scope.slides, {url: slideUrl});
      if(!_.isUndefined(sameSlide)) return;

      (function() {
        SlideService.getSlideId({url: slideUrl, serviceName: 'speakerdeck'})
        .success(function(slide) {
          if(_.isEmpty(slide)) return;

          $scope.slides.push({
              serviceName: 'speakerdeck'
            , id: slide.slideId
            , url: slideUrl
            , enbedCode: 'https://speakerdeck.com/assets/embed.js'
            , tweet: data.tweets[index]
          });
        });
      })();
    }
  }

  /**
   * ブラウザをフリーズさせずにツイートを全部表示させる
   */
  function IterateTweets(data) {
    var index       = 0
      , tweetLength = data.tweets.length
      , timer
      ;

    var process = function() {
      for(; index < tweetLength;) {

        insertTweetViewList(data, index);
        insertSlideViewList(data, index);

        $timeout(process, 5);
        index++;
        break;
      }
    };

    process();
  }

  // 命名が意味不明
  function getNewTweetInterval() {

    /**
     * 収集対象時間内であれば動作。
     * 新規ツイートがあれば自動で追加。
     */
    var nowTimeYMDHm = moment().format("YYYY-MM-DD HH:mm");
    var after4hFromEndedAt = moment(new Date($scope.events[0].endedAtYMDHm)).add('h', '4').format("YYYY-MM-DD HH:mm:ss");

    if(nowTimeYMDHm < after4hFromEndedAt) {

      var onTimeout
        , timer
        , INTERVAL = 30 * 1000
        ;

      var updateTweet = function() {
        Tweet.getNew(serviceName, eventId, lastTweetIdStr).
          success(function(data) {
            if(data.tweets.length === 0) return;

             IterateTweets(data);
          });
      };

      timer = $interval(updateTweet, INTERVAL);
      $scope.$on("$destroy", function() {
        if(timer) { $interval.cancel(timer); }
      });

    }
  }

}