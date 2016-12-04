'use strict';

var outDir = 'build/';

module.exports = {
  host: 'localhost',
  port: 3000,

  // app directories
  appDir: 'app',

  // unit test directories
  unitTestDir: 'app',

  // build test dir
  buildTestDir: outDir + 'test/',

  // build directories
  buildDir: outDir + 'app/',
  buildCss: outDir + 'app/css/',
  buildFonts: outDir + 'app/fonts/',
  buildImages: outDir + 'app/images/',
  buildJs: outDir + 'app/js/',
  extDir: outDir + 'app/pack/',
  extCss: outDir + 'app/pack/css/',
  extFonts: outDir + 'app/pack/fonts/',
  extJs: outDir + 'app/pack/js/'
};
