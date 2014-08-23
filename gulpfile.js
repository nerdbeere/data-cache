var gulp = require('gulp');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
require('setup-referee-sinon');
require('setup-referee-sinon/globals');

gulp.task('build', function () {
	return gulp.src('cache.js', {read: false})
		.pipe(browserify({
			insertGlobals : true
		}))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
});

gulp.task('build-example', function () {
	return gulp.src('example/example.js', {read: false})
		.pipe(browserify({
			insertGlobals : true
		}))
		.pipe(rename({ basename: 'bundle' }))
		.pipe(gulp.dest('./example/'))
});

gulp.task('test', function () {
	return gulp.src('*-spec.js', {read: false})
		.pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function () {
	gulp.src('*.js')
		.pipe(watch(function(files) {
			return gulp.src('*-spec.js', {read: false})
				.pipe(mocha({reporter: 'spec', growl: true}));
		}));
});