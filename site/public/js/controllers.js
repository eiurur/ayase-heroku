function IndexCtrl($scope, $http, $rootScope, $timeout, termsService, tweetsNumService, Page) {

  // パフォーマンスを考慮して
  // 最初に10ツイート以上含んだイベントデータを10件分取得し、
  $http.get('/api/readInitEvent/').
    success(function(data) {
      $scope.events = data.events;

      // 全てのイベントデータを取得。
      $http.get('/api/readAllEvent/').
        success(function(data) {

          // 0件( = つい消し)だと無限ローディングに陥る
          var length = data.events.length;
          var index = 0;
          var process = function() {

            // ブラウザをフリーズさせずにツイートを全部表示させる
            for (; index < length;) {

              // DBから取得したイベントデータに被りがあるため、その差分を埋めていく
              if(!_.findWhere($scope.events, {'eventId': data.events[index].eventId})){

                // $scope.events.push(data.events[index]); より高速
                $scope.events[$scope.events.length] = data.events[index];
              }

              $timeout(process, 5);
              index++;
              break;
            }
          };

          process();
        });
    });

  $http.get('/api/readEventOnTheDay/').
    success(function(data) {
      if(data.eventsOnTheDay.length　=== 0){
        $scope.eventsOnTheDay = [{
            title: "開催予定のイベントはありません"
          , eventUrl: "#"
        }];
      }
      $scope.eventsOnTheDay = data.eventsOnTheDay;
    });

  Page.setTitle("Ayase");
  $rootScope.title = Page.title();

  $scope.terms = termsService.terms;
  $scope.selectedTerm = $scope.terms[3];

  $scope.tweetsNum = tweetsNumService.tweetsNum;
  $scope.selectedTweetNum = $scope.tweetsNum[1];

}


function DetailCtrl($scope, $http, $rootScope, $routeParams, $location, $timeout, Page) {

  function insertTweetViewList(data) {
    var index        = 0
      , tweetLength  = data.tweets.length
      , process      = function() {

      // ブラウザをフリーズさせずにツイートを全部表示させる
      for (; index < tweetLength;) {

        // $scope.tweets.push(data.tweets[index]); より高速
        $scope.tweets[$scope.tweets.length] = data.tweets[index];
        lastTweetIdStr = data.tweets[index].tweetIdStr;

        $timeout(process, 5);
        index++;
        break;
      }
    };

    process();
  }


  /**
   * ページ描画時に最初に行う処理
   */
  var lastTweetIdStr
    , serviceName = $routeParams.serviceName || "connpass"
    , eventId     = $routeParams.eventId || 0
    ;

  // 最初の20件を取得
  $http.get('/api/readTweet/' + serviceName + '/' + eventId).
    success(function(data) {
      var tweetLength = data.tweets.length;

      $scope.tweets = data.tweets;

      // URLから無効なページへ直接アクセスされたときはindexページへリダイレクト
      if(tweetLength === 0) {
        console.log("No tweets");
        $location.path('/');
      }

      // FDBへ無駄なクエリは投げない
      if(tweetLength < 10) {
        console.log(tweetLength);
        return;
      }

      // 残りのツイートを取得
      $http.get('/api/readRestTweet/' + serviceName + '/' + eventId).
        success(function(data) {
          insertTweetViewList(data);
        });
    });

  /**
   * 新規ツイートがあれば自動で追加。
   */
  var onTimeout
    , timer
    , INTERVAL = 30 * 1000
    ;

  onTimeout = function() {
    $http.get('/api/readNewTweet/' + serviceName + '/' + eventId + '/' + lastTweetIdStr).
      success(function(data) {
        if(data.tweets.length === 0) return;

        // Update!!
        insertTweetViewList(data);
      });

    timer = $timeout(onTimeout, INTERVAL);
  };

  timer = $timeout(onTimeout, INTERVAL);

  $scope.$on("$destroy", function() {
    if (timer) {
      $timeout.cancel(timer);
    }
  });

  /**
   * イベントの情報を取得
   */
  $http.get('/api/readEventByEventId/' + serviceName + '/' + eventId).
    success(function(data) {
      $scope.events = data.events;

      // 0件( = つい消し)だと[0]なんてプロパティねーよって怒られる。
      Page.setTitle($scope.events[0].title);
      $rootScope.title = Page.title();
    });

  // シェアボタンのURL割り当て用
  $scope.absUrl = $location.absUrl();

  // ツイート一覧の並び順をtweetIDで昇順に変更。
  $scope.reverse = false;
}