(function () {
  'use strict';

  angular
    .module('home')
    .config(config);

  /* jshint -W034 */
  function config($stateProvider) {
    'ngInject';
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'home/home.tpl.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      });
  }
}());
