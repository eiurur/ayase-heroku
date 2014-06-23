function IndexCtrl($scope, $http) {
  $http.get('/api/readEventStartedAtDesc/').
    success(function(data) {
      $scope.events = data.events;
    });
  $http.get('/api/readTweet/').
    success(function(data) {
      $scope.tweets = data.tweets;
    });

  $scope.searchWord = "";

  $scope.terms = [
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

  $scope.selectedTerm = $scope.terms[3];

  $scope.tweetsNum = [
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

  $scope.selectedTweetNum = $scope.tweetsNum[1];

}

function DetailCtrl($scope, $http, $routeParams, $location) {
  $http.get('/api/readTweet/' + $routeParams.eventId).
    success(function(data) {
      $scope.tweets = data.tweets;
    });
  $http.get('/api/readEventByEventId/' + $routeParams.eventId).
    success(function(data) {
      $scope.events = data.events;
    });

  $scope.absUrl = $location.absUrl();

  // ツイート一覧の並び順を変更。
  $scope.reverse = false;
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}
