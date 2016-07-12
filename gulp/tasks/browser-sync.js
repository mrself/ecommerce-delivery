var gulp = require('gulp'),
	config = require('../config').browserSync,
	browserSync = require('browser-sync').create(config.name);

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: config.dir
		},
		files: [config.dir + '/**/*.html', config.dir + '/spec.js'],
		browser: []
	});
});