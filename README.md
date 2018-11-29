#	sturnus

__Make multi-processes programming easier.__  

[![NPM](https://nodei.co/npm/sturnus.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/sturnus)

JavaScript is known as single-threaded, which makes things easier to understand and control. However, most computers we using today have more than 2 CPU cores. While a single-threaded program running, only one CPU core is working and the others are idle. Built-in module [cluster](https://nodejs.org/dist/latest-v7.x/docs/api/cluster.html) of Node.js will help us to take adventage of multi-core systems. Package *sturnus* is just based on cluster module.

To install *sturnus* as dependency of your package, please add ``--only=prod`` to prevent the devDependencies from being installed:  
```bash
# Install without devDependencies.
npm install sturnus --only=prod --save
```

##	Get Started, Multi-threaded Programming with sturnus

With *sturnus*, execuating in a forked process is almost as easy as normal asynchronous calling, execept that __passed parameters and returned values SHOULD BE SERIALIZABLE__.

You may run the next example by:  
```bash
# Change to the package's directory.
cd node_modules/sturnus

# Install with devDependencies.
npm install

# Run test command.
npm test
```

###	Step 1, Extend Worker

Here __worker__ refers to a JavaScript module to execute some tasks as do an asynchronous function. You will get your own worker by extending ``sturnus/worker``, e.g.  
```javascript
// FILE: extended_worker.js

var worker = require('sturnus/worker');

// Define a task processor.
worker.on('minify', function(script, options, callback) {
	// The last parameter of the processor function SHOULD be a callback function.

	if (typeof options == 'function') {
		callback = options;
		options = null;
	}

	try {
		var result = require('uglify-js').minify(script, options);
		setTimeout(function() {
			callback(null, result);
		}, Math.random() * 1000);
	}
	catch (ex) {
		callback(ex);
	}
});

// Start the worker.
worker.start();
```

Attentions to next things:

*	The last parameter of the processor function SHOULD be a callback function.
*	Other arguments of the processor function excepting ``callback`` SHOULD be serializable.
*	Arguments passed to ``callback()`` SHOULD be serializable.
*	The worker will not accept messages or execute tasks until ``.start()`` invoked.

###	Step 2, Run Workers & Execute A Task

*sturnus* supplies a homonymous module to start and manage the workers, e.g.  
```javascript
// FILE: test.js

// Import the Sturnus module.
var Sturnus = require('sturnus');

// Create instance by supplying pathname of the extended worker javascript file.
var jspath = path.join(__dirname, 'extended_worker.js');
var sturnus = new Sturnus(jspath);

// Execute task.
sturnus.exec('minify', __filename, function(err, js) {
	//
});
```

###	Step 3, Run Tasks Parallelly

Certainly, what we want is not just to run tasks in forked process one by one. To take adventage of multi-core systems, we want more workers and make them run parallely. By default, on starting, *sturnus* will create as many workers as cores the current system has. When ``.exec()`` invoked, the task will be assigned to one of the idle workers to really execute, or kept in queue until there are some workers become idle again.

```javascript
[0,1,2,3,4,5,6,7,8,9].forEach(function(n) {
	var name = 'jsmin-' + n;
	console.time(name);
	sturnus.exec('minify', __filename, function(err, js) {
		console.timeEnd(name);
	});
});
```

##	API

*	class __Sturnus__(Object *options*)  
	To create an instance of *sturnus* management.

	*	string *options.js*
	*	number *options.workers*

*	class __Sturnus__(string *jspath*)  
	Downward compatible style of `new Sturnus({ js })`.

*	__\<sturnus\>.exec__(*taskname* [, *args* ...] [, *callback*])  
	To execute some task.

*	__\<sturnus\>.terminate__()  
	To terminate all the sub processes forked by *sturnus*. If some sub processes are not idle, *sturnus* will keep waiting till them finishes their current tasks.

##	About

[Sturnus](https://en.wikipedia.org/wiki/Sturnus) is a genus of starlings, the birds commonly living in groups.
