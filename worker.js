/**
 * 定义一个单任务进程。
 * 所谓单任务，是指进程同一时间只处理一个任务请求。管理进程（父进程）中会标志任务进程（子进程）
 * 的忙闲状态，以确保仅将任务分派给空闲状态的任务进程。任务进程自身毋须考虑任务调度问题。
 */

var MODULE_REQUIRE
	/* built-in */

	/* NPM */

	/* in-package */
	;

// 任务处理器容器。
var _tasks = {};

/**
 * 向管理进程反馈消息。
 * 注意：所有数据都应当是可序列化的。
 */
var _response = function(err, data) {
	process.send(Array.from(arguments));
};

var worker = {};

/**
 * 启动消息接收功能，进程可以接收来自父进程的消息，并调用相应的方法处理数据。
 */
worker.start = function() {
	var self = this;

	process.on('message', function(msg) {
		// 消息由管理进程传递给任务进程，管理进程确保消息格式为一个数组，且首项为任务名。
		var taskname = msg[0];
		var args = msg.slice(1);

		// 获取任务处理器。
		// 如果任务未定义处理器，则直接返回错误对象。
		var processor = _tasks[taskname];
		if (!processor) {
			_response(new Error('action ' + name + ' not defined'));
		}
		else {
			args.push(_response);
			processor.apply(null, args);
		}
	});
};

/**
 * @param {string}    name
 * @param {function}  processor
 * processor 参数表的最后一位，必须是回调函数，且该回调函数的参数表符合形如 err, data, ... 的标准形式。
 */
worker.on = function(taskname, processor) {
	_tasks[taskname] = processor;
};

module.exports = worker;
