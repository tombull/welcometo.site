(function () {
  'use strict';

  class HomeCtrl {
    constructor($scope) {
      'ngInject';
      const vm = this;
      vm.$scope = $scope;
    }
  }

  /**
   * @ngdoc object
   * @name home.controller:HomeCtrl
   *
   * @description
   *
   */
  angular
    .module('home')
    .controller('HomeCtrl', HomeCtrl);
}());
