var notify = require('gulp-notify');
module.exports = function (error) {
	var args = Array.prototype.slice.call(arguments);
	// gutil.log(error.stack);
	notify.onError({
		title: "Compile Error",
		message: "<%= error.message %>"
	}).apply(this, args);
	this.emit('end'); // Keep gulp from hanging on this task
};