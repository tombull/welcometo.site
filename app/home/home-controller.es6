(function () {
  'use strict';

  class HomeCtrl {
    constructor($scope, Pubnub, $log, $pubnubChannel, $interval) {
      'ngInject';
      const vm = this;
      vm.$scope = $scope;
      vm.$log = $log;
      vm.$pubnubChannel = $pubnubChannel;
      vm.$interval = $interval;
      vm.thePosition = 'Something';
      vm.lat = 1;
      vm.long = 1;
      vm.Pubnub = Pubnub;
      vm.Pubnub.init({
        publishKey: 'pub-c-bd389cd2-4ed5-46b8-884e-6cb24623872d',
        subscribeKey: 'sub-c-385e20e6-b9ac-11e6-9868-02ee2ddab7fe'
      });
      vm.$scope.channel = $pubnubChannel('location');
      vm.$interval(() => {
        vm.Pubnub.publish({
          message: {
            request: 'whereAreYou'
          },
          channel: 'locationrequest'
        }, (status, response) => {
          if (status.error) {
            vm.$log.log(status);
          } else {
            vm.$log.log('message Published w/ timetoken', response.timetoken);
          }
        });
      }, 100);
      vm.Pubnub.addListener({
        message: message => {
          vm.$log.log(message);
        }
      });
      vm.Pubnub.subscribe({
        channels: ['location']
      });
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
