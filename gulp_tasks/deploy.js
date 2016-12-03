const path = require('path');

var argv = require('yargs').argv;

const gulp = require('gulp');
const git = require('gulp-git');
const filter = require('gulp-filter');


gulp.task('gitadd', function(done){
  git.add({args: '-A', cwd: './dist'});
  done();
});

gulp.task('gitcommit', function(done){
  git.commit('Deployment (version: ' + argv.m + ')', {args: '-a', cwd: './dist'});
  done();
});

gulp.task('gitpush', function(done){
  git.push('origin', 'master', {args: '-f', cwd: path.join(process.cwd(), 'dist')}, function (err) {
    if (err) throw err;
  });
  done();
});

gulp.task('deploy', gulp.series('gitadd', 'gitcommit', 'gitpush'));
