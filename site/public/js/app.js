// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngRoute', 'ngSanitize', 'infinite-scroll', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.factories'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/detail/:serviceName/:eventId', {
        templateUrl: 'partials/detail',
        controller: DetailCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);