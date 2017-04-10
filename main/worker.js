/**
 * 任务进程管理类。
 */

var MODULE_REQUIRE
	/* built-in */
	, child_process = require('child_process')
	, events = require('events')
	, path = require('path')
	, util = require('util')

	/* NPM */

	/* in-package */
	;

// 任务进程。
function Worker(jspath) {
	events.EventEmitter.call(this);

	this._process = child_process.fork(jspath);
	this._idle = true;
}

// 继承 EventEmitter 类。
util.inherits(Worker, events.EventEmitter);

// 通过向任务进程发送消息来分派任务。
Worker.prototype.exec = function(msg, callback) {
	var that = this;
	if (this._idle) {
		this._idle = false;
		this._process.send(msg);
		this._process.once('message', function(msg) {
			that._idle = true;
			that.emit('idle');

			// 封装后任务进程可保证返回的消息体是数组结构。
			callback && callback.apply(null, msg);
		});
		return true;
	}
	else {
		return false;
	}
};

// 退出任务进程。
// 如当前有任务在执行，则待当前任务执行完成后退出。
Worker.prototype.kill = function() {
	if (this._idle) {
		this._process.kill();
	}
	else {
		var that = this;
		this.on('idle', function() {
			that._process.kill();
		});
	}
};

// 返回空闲状态。
Worker.prototype.idle = function() {
	return this._idle;
};

module.exports = Worker;
