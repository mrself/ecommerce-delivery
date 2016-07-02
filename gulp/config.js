var src = './src/';
var build = './tests/';
var bourbon = require('node-bourbon');

module.exports = {
	browserify: {
		bundleConfigs: [{
			entries: './tests/app.js',
			dest: build,
			outputName: 'app.min.js'
		}]
	},
	css: {
		settings: {
			style: 'compressed',
			errLogToConsole: true,
			includePaths: [
				bourbon.includePaths
			]
		},
		dest: build + 'css/',
		src: src + 'scss/**/*.scss'
	},

	browserSync: {
		name: 'tests',
		dir: './tests'
	}
};