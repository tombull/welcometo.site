(function () {
  'use strict';

  angular
    .module('welcomeToSite')
    .config(config)
    .directive('showDuringResolve', showDuringResolveDirective);

  function config($urlRouterProvider, $stateProvider) {
    'ngInject';
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('site', {
      abstract: true
    });
  }

  function showDuringResolveDirective($rootScope) {
    'ngInject';

    return {
      link(scope, element) {
        const unregisterStart = $rootScope.$on('$stateChangeStart', () => {
              element.removeClass('ng-hide');
            }),
            unregisterEnd = $rootScope.$on('$stateChangeSuccess', () => {
              element.addClass('ng-hide');
            }),
            unregisterError = $rootScope.$on('$stateChangeError', () => {
              element.addClass('ng-hide');
            }),
            unregisterCancel = $rootScope.$on('$stateChangeCancel', () => {
              element.addClass('ng-hide');
            });
        element.addClass('ng-hide');
        scope.$on('$destroy', () => {
          unregisterStart();
          unregisterEnd();
          unregisterError();
          unregisterCancel();
        });
      }
    };
  }
}());
