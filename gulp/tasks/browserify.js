var browserify = require('browserify'),
	watchify = require('watchify'),
	source = require('vinyl-source-stream'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	config = require('../config').browserify,
	bundleLogger = require('../utils/bundleLogger'),
	handleErrors = require('../utils/handleErrors');

var browserSyncName = require('../config').browserSync.name;
var browserSync = require('browser-sync').get(browserSyncName);

gulp.task('browserify', function() {
	function browserifyThis (bundleConfig) {
		var bundler = browserify({
			cache: {}, packageCache: {}, fullPaths: false,
			entries: bundleConfig.entries
		});
		var watcher = watchify(bundler);
		function bundle () {
			bundleLogger.start(bundleConfig.outputName);
			return watcher
				.bundle()
				.on('error', handleErrors)
				.pipe(source(bundleConfig.outputName))
				.pipe(gulp.dest(bundleConfig.dest))
				.on('end', function() {
					bundleLogger.end(bundleConfig.outputName);
					browserSync.reload();
				});
		}
		watcher.on('update', bundle);
		bundleLogger.watch(bundleConfig.outputName);
		return bundle();
	}
	config.bundleConfigs.forEach(browserifyThis);
});
