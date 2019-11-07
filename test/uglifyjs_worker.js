var MODULE_REQUIRE
	/* built-in */

	/* NPM */
	, UglifyJS = require('uglify-js')

	/* in-package */
	, worker = require('../worker')
	;

worker.on('minify', function(script, options, callback) {
	if (typeof options == 'function') {
		callback = options;
		options = null;
	}

	console.log('JOB', process.env.JOB);

	try {
		var result = UglifyJS.minify(script, options);
		setTimeout(function() {
			callback(null, result);
		}, Math.random() * 1000);
	}
	catch (ex) {
		callback(ex);
	}
});

worker.start();
