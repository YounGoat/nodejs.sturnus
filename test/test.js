var MODULE_REQUIRE
	/* built-in */
	, path = require('path')

	/* NPM */

	/* in-package */
	, Sturnus = require('../main')
	;

var sturnus = new Sturnus({
	js: path.join(__dirname, 'uglifyjs_worker.js'),
	env: {
		'JOB': 'JS-min',
	},
});

[0,1,2,3,4,5,6,7,8,9].forEach(function(n, index) {
	var name = 'jsmin-' + index;
	console.time(name);
	sturnus.exec('minify', __filename, function(err, js) {
		console.timeEnd(name);
	});
});

sturnus.terminate();
