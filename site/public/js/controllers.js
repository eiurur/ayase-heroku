function IndexCtrl($scope, $http, $rootScope, termsService, tweetsNumService, eventsStashService, Page) {

  // パフォーマンスの都合上
  // 最初に10ツイート以上含んだイベントデータを20件分取得し、
  $http.get('/api/readInitEvent/').
    success(function(data) {
      $scope.events = data.events;

      // 残りの全てのイベントデータを取得。
      $http.get('/api/readRestEvent/').
        success(function(data) {
          _.each(data.events, function(num, index){
            $scope.events.push(data.events[index]);
          });
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


function DetailCtrl($scope, $http, $rootScope, $routeParams, $location, Page) {

  // 最初の20件を取得
  $http.get('/api/readTweet/' + $routeParams.eventId).
    success(function(data) {
      $scope.tweets = data.tweets;

      if(data.tweets.length < 20) {
        console.log(data.tweets.length);
        return;
      }

      // 残りのツイートを取得
      $http.get('/api/readRestTweet/' + $routeParams.eventId).
        success(function(data) {
          _.each(data.tweets, function(num, index){
            $scope.tweets.push(data.tweets[index]);
          });
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