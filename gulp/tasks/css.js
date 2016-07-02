var gulp = require('gulp'),
	sass = require('gulp-sass'),
	watch = require('gulp-watch'),
	rename = require('gulp-rename'),
	cssNano = require('gulp-cssnano'),
	config = require('../config'),
	handleErrors = require('../utils/handleErrors'),
	browserSync = require('browser-sync').get(config.browserSync.name);	

gulp.task('css', function() {
	return gulp.src(config.css.src)
		.pipe(sass(config.css.settings))
		.on('error', handleErrors)
		.pipe(cssNano())
		.pipe(rename('app.min.css'))
		.pipe(gulp.dest(config.css.dest))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('css:watch', function() {
	watch(config.css.src, function() {
		gulp.start('css');
	});
});