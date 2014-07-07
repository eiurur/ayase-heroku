function IndexCtrl($scope, $http, $rootScope, $timeout, termsService, tweetsNumService, eventsStashService, Page) {

  // パフォーマンスを考慮して
  // 最初に10ツイート以上含んだイベントデータを10件分取得し、
  $http.get('/api/readInitEvent/').
    success(function(data) {
      $scope.events = data.events;

      // 全てのイベントデータを取得。
      $http.get('/api/readAllEvent/').
        success(function(data) {

          var length = data.events.length;
          var index = 0;
          var process = function() {

            // ブラウザをフリーズさせずにツイートを全部表示させる
            for (; index < length;) {

              // DBから取得したイベントデータに被りがあるため、その差分を埋めていく
              // 
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

  // 最初の20件を取得
  $http.get('/api/readTweet/' + $routeParams.eventId).
    success(function(data) {
      $scope.tweets = data.tweets;

      if(data.tweets.length < 10) {
        console.log(data.tweets.length);
        return;
      }

      // 残りのツイートを取得
      $http.get('/api/readRestTweet/' + $routeParams.eventId).
        success(function(data) {
          var length = data.tweets.length;
          var index = 0;
          var process = function() {

            // ブラウザをフリーズさせずにツイートを全部表示させる
            for (; index < length;) {

              // $scope.tweets.push(data.tweets[index]); より高速
              $scope.tweets[$scope.tweets.length] = data.tweets[index];

              $timeout(process, 5);
              index++;
              break;
            }
          };

          process();
        });
    });

  $http.get('/api/readEventByEventId/' + $routeParams.eventId).
    success(function(data) {
      $scope.events = data.events;

      Page.setTitle($scope.events[0].title);
      $rootScope.title = Page.title();
    });

  $scope.absUrl = $location.absUrl();

  // ツイート一覧の並び順を変更。
  $scope.reverse = false;
}