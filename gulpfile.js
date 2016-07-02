require('require-dir')('./gulp/tasks', {recurse: true});

require('gulp').task('default', ['css', 'browserify', 'css:watch', 'browserSync']);