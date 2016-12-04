'use strict';

var _ = require('underscore.string')
  , fs = require('fs')
  , path = require('path')

  , bowerDir = JSON.parse(fs.readFileSync('.bowerrc')).directory + path.sep;

module.exports = function (gulp, $, config) {
  $.yargs.default('stage', 'dev');
  $.yargs.default('config', 'wagstaffs');
  var isProd = $.yargs.argv.stage === 'prod';

  // delete build directory
  gulp.task('clean', function () {
    return $.del(config.buildDir);
  });

  // compile markup files and copy into build directory
  gulp.task('markup', ['clean'], function () {
    //var pugFilter = $.filter('**/*.pug', {restore: true});
    //var fileManagerFilter = $.filter(config.fileManagerMarkupFiles, {restore:true});
    return gulp.src(config.appMarkupFiles)
      // config.fileManagerMarkupFiles
      // .pipe(pugFilter)
      .pipe($.pug({doctype: 'html', pretty: true}))
      .pipe($.if(isProd, $.htmlmin({
        collapseWhitespace: true,
        removeComments: false
      })))
      // .pipe(pugFilter.restore)
      // .pipe(fileManagerFilter)
      // .pipe($.rename((path) => {
      //   path.dirname = 'filemanager/' + path.dirname;
      // }))
      // .pipe(fileManagerFilter.restore)
      .pipe(gulp.dest(config.buildDir));
  });

  // compile styles and copy into build directory
  gulp.task('styles', ['clean'], function () {
    var pipeline = gulp.src(config.appStyleFiles)
      // config.fileManagerStyleFiles
      // .pipe(scssFilter)
      .pipe($.sourcemaps.init())
      .pipe($.plumber({errorHandler: function (err) {
        $.notify.onError({
          title: 'Error linting at ' + err.plugin,
          subtitle: ' ', //overrides defaults
          message: err.message.replace(/\u001b\[.*?m/g, ''),
          sound: ' ' //overrides defaults
        })(err);

        this.emit('end');
      }}))
      .pipe($.sass({
        includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
      }))
      // .pipe(scssFilter.restore)
      .pipe($.autoprefixer({
        browsers: [
          '> 1%',
          'last 10 Chrome versions',
          'last 10 Firefox versions',
          'last 5 Edge versions',
          'IE >= 9',
          'Safari >= 5',
          'last 10 ChromeAndroid versions',
          'Android >= 4.3',
          'ExplorerMobile >= 10',
          'iOS >= 6'
        ]
      }));
    return pipeline
      .pipe($.if(isProd, $.concat('app.css')))
      .pipe($.if(isProd, $.cssmin()))
      .pipe($.if(isProd, $.rev()))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(config.buildCss));
  });

  // compile scripts and copy into build directory
  gulp.task('scripts', ['clean', 'analyze', 'markup'], function () {
    var es6Filter = $.filter('**/*.es6', {restore: true})
      , htmlFilter = $.filter('**/*.html', {restore: true})
      , jsFilter = $.filter('**/*.js', {restore: true})
      , configFilter = $.filter('**/*.dev.config.json', {restore: true})
      , fileManagerFilter = $.filter(config.fileManagerScriptFiles, {restore: true});
    if (isProd) {
      configFilter = $.filter('**/*.{prod,' + $.yargs.argv.config + '}.config.json', {restore: true})
    }
    return gulp.src([
      config.fileManagerScriptFiles,
      config.appScriptFiles,
      config.appConfigFiles,
      config.buildDir + '**/*.html',
      '!**/*_test.*',
      '!**/index.html'
    ])
      .pipe($.sourcemaps.init())
      .pipe(es6Filter)
      .pipe($.rename(function (filePath) {
        filePath.extname = '.js';
      }))
      .pipe($.if(isProd, $.preprocess({context: { NODE_ENV: 'production' }})))
      .pipe($.if(!isProd, $.preprocess({context: { NODE_ENV: 'development', DEBUG: true }})))
      .pipe($.babel({
  			presets: ['es2015']
  		}))
      .pipe(es6Filter.restore)
      .pipe(configFilter)
      .pipe($.ngConstant({
        template: '(function () { angular.module("<%- moduleName %>"<% if (deps) { %>, <%= JSON.stringify(deps) %><% } %>)<% constants.forEach(function(constant) { %>.constant("<%- constant.name %>", <%= constant.value %>) <% }) %>; }());'
      }))
      .pipe(configFilter.restore)
      .pipe(fileManagerFilter)
      .pipe($.rename((path) => {
        path.dirname = 'filemanager/' + path.dirname;
      }))
      .pipe(fileManagerFilter.restore)
      .pipe($.if(isProd, htmlFilter))
      .pipe($.if(isProd, $.ngHtml2js({
        // lower camel case all app names
        moduleName: _.camelize(_.slugify(_.humanize(require('../package.json').name))),
        declareModule: false
      })))
      .pipe($.if(isProd, htmlFilter.restore))
      .pipe(jsFilter)
      .pipe($.if(isProd, $.angularFilesort()))
      .pipe($.if(isProd, $.concat('app.js')))
      .pipe($.if(isProd, $.ngAnnotate()))
      .pipe($.if(isProd, $.replace(/["']ngInject["'];*/g, "")))
      .pipe($.if(isProd, $.uglify()))
      .pipe($.if(isProd, $.rev()))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(config.buildJs))
      .pipe(jsFilter.restore);
  });

  // inject custom CSS and JavaScript into index.html
  gulp.task('inject', ['markup', 'styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js', {restore: true});

    return gulp.src(config.buildDir + 'index.html')
      .pipe($.inject(gulp.src([
          config.buildCss + '**/*',
          config.buildJs + '**/*'
        ])
        .pipe(jsFilter)
        .pipe($.angularFilesort())
        .pipe(jsFilter.restore), {
          addRootSlash: false,
          ignorePath: config.buildDir
        })
      )
      .pipe(gulp.dest(config.buildDir));
  });

  // copy bower components into build directory
  gulp.task('bowerCopy', ['inject'], function () {
    var // cssFilter = $.filter('**/*.css', {restore: true}),
        jsFilter = $.filter('**/*.js', {restore: true});
    var pipeline = gulp.src($.mainBowerFiles(), {base: bowerDir})
      .pipe(jsFilter);
    return pipeline
      .pipe($.if(isProd, $.concat('pack.js')))
      .pipe($.if(isProd, $.uglify({
        preserveComments: $.uglifySaveLicense
      })))
      .pipe($.if(isProd, $.rev()))
      .pipe(gulp.dest(config.extDir))
      .pipe(jsFilter.restore);
  });

  // inject bower components into index.html
  gulp.task('bowerInject', ['bowerCopy'], function () {
    var bowerExcludeList = [];

    if (isProd) {
      return gulp.src(config.buildDir + 'index.html')
        .pipe($.inject(gulp.src([
          // config.extDir + 'pack*.css',
          config.extDir + 'pack*.js'
        ], {
          read: false
        }), {
          starttag: '<!-- bower:{{ext}} -->',
          endtag: '<!-- endbower -->',
          addRootSlash: false,
          ignorePath: config.buildDir
        }))
        .pipe(gulp.dest(config.buildDir));
    } else {
      return gulp.src(config.buildDir + 'index.html')
        .pipe($.wiredep.stream({
          exclude: bowerExcludeList,
          ignorePath: '../../' + bowerDir.replace(/\\/g, '/'),
          fileTypes: {
            html: {
              replace: {
                css: function (filePath) {
                  return '<link rel="stylesheet" href="' + config.extDir.replace(config.buildDir, '') +
                    filePath + '">';
                },
                js: function (filePath) {
                  return '<script src="' + config.extDir.replace(config.buildDir, '') +
                    filePath + '"></script>';
                }
              }
            }
          }
        }))
        .pipe(gulp.dest(config.buildDir));
    }
  });

  // copy Bower fonts and images into build directory
  gulp.task('bowerImages', ['clean'], function () {
    var iamgeFilter = $.filter('**/*.{gif,jpg,jpeg,png}', {restore: true});
    return gulp.src($.mainBowerFiles(), {base: bowerDir})
      .pipe(iamgeFilter)
      .pipe(gulp.dest(config.buildImages))
      .pipe(iamgeFilter.restore);
  });

  // copy Bower fonts and images into build directory
  gulp.task('bowerFonts', ['clean'], function () {
    var fontFilter = $.filter('**/*.{eot,otf,svg,ttf,woff,woff2}', {restore: true});
    return gulp.src($.mainBowerFiles(), {base: bowerDir})
      .pipe(fontFilter)
      .pipe($.rename({dirname: ''}))
      .pipe(gulp.dest(config.buildFonts))
      .pipe(fontFilter.restore);
  });

  // copy custom fonts into build directory
  gulp.task('fonts', ['clean'], function () {
    var fontFilter = $.filter('**/*.{eot,otf,svg,ttf,woff,woff2}', {restore: true});
    return gulp.src([config.appFontFiles])
      .pipe(fontFilter)
      .pipe($.rename({dirname: ''}))
      .pipe(gulp.dest(config.buildFonts))
      .pipe(fontFilter.restore);
  });

  // copy static assets
  gulp.task('staticassets', ['clean'], function () {
    return gulp.src(config.staticAssetFiles)
      .pipe(gulp.dest(config.buildDir));
  });

  // copy and optimize images into build directory
  gulp.task('images', ['clean'], function () {
    return gulp.src(config.appImageFiles)
      .pipe($.if(isProd, $.imagemin()))
      .pipe(gulp.dest(config.buildImages));
  });

  gulp.task('copyTemplates', ['bowerInject'], function () {
    // always copy templates to testBuild directory
    var stream = $.streamqueue({objectMode: true});

    stream.queue(gulp.src([config.buildDirectiveTemplateFiles]));

    return stream.done()
      .pipe(gulp.dest(config.buildTestDirectiveTemplatesDir));
  });

  gulp.task('deleteTemplates', ['copyTemplates'], function (cb) {
    // only delete templates in production
    // the templates are injected into the app during prod build
    if (!isProd) {
      return cb();
    }

    gulp.src([config.buildDir + '**/*.html'])
      .pipe(gulp.dest('tmp/' + config.buildDir))
      .on('end', function () {
        $.del([
          config.buildDir + '**/*.html',
          '!' + config.buildCss,
          '!' + config.buildFonts,
          '!' + config.buildImages,
          '!' + config.buildJs,
          '!' + config.extDir,
          '!' + config.buildDir + 'index.html'
        ], {mark: true})
          .then(function () {
            $.del([
              config.buildDir + '**/*',
              '!**/*.*',
              '!' + config.buildCss,
              '!' + config.buildCss + '**/*',
              '!' + config.buildFonts,
              '!' + config.buildFonts + '**/*',
              '!' + config.buildImages,
              '!' + config.buildImages + '**/*',
              '!' + config.buildJs,
              '!' + config.buildJs + '**/*',
              '!' + config.extDir,
              '!' + config.extDir + '**/*'
            ], {mark: true})
              .then(function () {
                cb();
              });
          });
      });
  });

  gulp.task('build', ['deleteTemplates', 'bowerFonts', 'bowerImages', 'images', 'staticassets', 'fonts']);
};
