/**
 * 定义任务进程集群，用于管理任务进程及分派任务。
 */

var MODULE_REQUIRE
	/* built-in */
	, child_process = require('child_process')
	, events = require('events')
	, os = require('os')
	, path = require('path')
	, util = require('util')

	/* NPM */

	/* in-package */
	, Worker = require('./worker')
	;

// 任务集群。
function Cluster(jspath) {
	events.EventEmitter.call(this);

	var CPU_COUNT = os.cpus().length;
	var that = this;

	this._queue = [];
	this._workers = [];
	for (var i = 0; i < CPU_COUNT; i++) {
		this._workers[i] = new Worker(jspath);

		// 监听进程的 idle 事件。
		// 当进程空闲时，若队列中有等候任务，则执行该任务。
		this._workers[i].on('idle', function() {
			var task = that._queue.shift();
			if (task) {
				this.exec(task.msg, task.callback);
				// @todo 处理执行失败。

				// 若队列长度由 1 减少为 0，则触发 clear 事件。
				if (that._queue.length == 0) {
					that.emit('clear');
				}
			}
		});
	}
}

// 继承 EventEmitter 类。
util.inherits(Cluster, events.EventEmitter);

// 终止。
Cluster.prototype.terminate = function() {
	var that = this;

	var doKill = function() {
		for (var i = 0; i < that._workers.length; i++) {
			that._workers[i].kill();
		}
	};

	// 如果队列不为空，则等待。
	if (this._queue.length) {
		this.on('clear', doKill);
	}
	else{
		doKill();
	}
};

// 获取一个空闲进程。
Cluster.prototype._getIdleWorker = function() {
	var worker = null;
	for (var i = 0; i < this._workers.length; i++) {
		if (this._workers[i].idle()) {
			worker = this._workers[i];
			break;
		}
	}
	return worker;
};


/**
 * 向集群提交任务。视任务进程的忙闲情况，提交的任务可能需要在队列中等候执行。
 * 参数表中的最后一个参数如果是一个函数，则该函数被视为回调函数。回调函数不是必须的。
 * 其他参数将被装入一个数组，作为消息传递给任务进程，因此，这此参数必须是可序列化的。
 */
Cluster.prototype.exec = function(/* msg [, ...] [, callback] */) {
	var msg = Array.from(arguments);

	var callback = null;

	// 获取回调函数。
	// 回调函数不是必须的。
	if (msg.length && typeof msg[msg.length-1] == 'function') {
		callback = msg.pop();
	}

	var worker = this._getIdleWorker();

	// 若没有空闲进程，则将任务放入等候队列。
	if (!worker) {
		this._queue.push({
			msg: msg,
			callback: callback
		});
	}

	// 否则，执行任务。
	else {
		worker.exec(msg, callback);
	}
};

module.exports = Cluster;
