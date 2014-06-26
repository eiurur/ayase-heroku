function IndexCtrl($scope, $http, $rootScope, termsService, tweetsNumService, eventsStashService, Page) {
  $http.get('/api/readEventStartedAtDesc/').
    success(function(data) {
      $scope.events = data.events;
    });
  $http.get('/api/readEventOnTheDay/').
    success(function(data) {
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
  $http.get('/api/readTweet/' + $routeParams.eventId).
    success(function(data) {
      $scope.tweets = data.tweets;
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