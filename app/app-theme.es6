(function () {
  'use strict';

  /* @ngdoc object
   * @name welcomeToSite
   * @description
   *
   */
  angular
    .module('welcomeToSite')
    .config(materialTheme);

  function materialTheme($mdThemingProvider) {
    'ngInject';
    $mdThemingProvider.definePalette('wagstaffs-green', {
      50: 'f0f7e8',
      100: 'daebc6',
      200: 'c1dea1',
      300: 'rgba(131, 189, 66, 0.7)',
      400: '#96c75e',
      500: 'rgba(102, 163, 47, 1)',
      600: 'rgba(131, 189, 66, 0.9)',
      700: 'rgba(86, 149, 37, 1)',
      800: 'rgba(131, 189, 66, 0.9)',
      900: 'rgba(58, 125, 20, 0.7)',
      A100: 'ccff90',
      A200: 'b2ff59',
      A400: '76ff03',
      A700: '64dd17',
      contrastDefaultColor: 'light',
      contrastDarkColors: ['50', '100', '200', 'A100', 'A200', 'A700']
    });
    $mdThemingProvider.definePalette('transparent-grey', {
      50: '#fafafa',
      100: '#f5f5f5',
      200: 'rgba(238, 238, 238, 0.8)',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#ffffff',
      A200: '#000000',
      A400: '#303030',
      A700: '#616161',
      contrastDefaultColor: 'dark',
      contrastLightColors: '600 700 800 900 A200 A400 A700'
    });
    const currentTheme = $mdThemingProvider.theme('default')
      .primaryPalette('wagstaffs-green', {
        default: '800',
        'hue-1': '600',
        'hue-2': '300',
        'hue-3': '50'
      })
      .accentPalette('light-blue')
      .warnPalette('deep-orange')
      .backgroundPalette('transparent-grey', {
        default: '200',
        'hue-1': 'A100',
        'hue-2': '300',
        'hue-3': '50'
      });
    currentTheme.foregroundPalette = {
      name: 'dark',
      1: 'rgba(0,0,0,0.87)',
      2: 'rgba(0,0,0,0.68)',
      3: 'rgba(0,0,0,0.55)',
      4: 'rgba(0,0,0,0.35)'
    };
  }
}());
