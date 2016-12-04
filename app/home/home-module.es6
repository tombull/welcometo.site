(function () {
  'use strict';

  /* @ngdoc object
   * @name home
   * @description
   *
   */
  angular
    .module('home', [
      'ui.router'
    ])
    .directive('enableAnimate', enableAnimate)
    .directive('disableAnimate', disableAnimate);

  /* eslint-disable */
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }
  /* eslint-enable */

  function enableAnimate($animate) {
    'ngInject';

    return (scope, element) => $animate.enabled(element, true);
  }

  function disableAnimate($animate) {
    'ngInject';

    return (scope, element) => $animate.enabled(element, false);
  }
}());
