var evt = require('event-timer');
var util = require('util');
var event = require('events').EventEmitter;
var http = require('http');
var https = require('https');
var HTTPStatus = require('http-status');
var urlp = require('url');
const Check = require('./models/Check');
const { createReport } = require('./utils/reportNotification');

class urlk {
	constructor(options) {
		this.interval = options.interval || 5000;
		this.timeout = options.timeout || 3000;
		this.eventTimer = options.eventTimer || 'true';
		this.handle = null;
		this.running = false;

		this.urlmon = new Object();
		this.list = new Object();
		for (var item in options.list) {
			this.list[options.list[item]] = {
				code: null,
				status: null,
				time: null,
			};
		}

		if (this.eventTimer == 'true') {
			this.check = new evt({
				interval: this.interval || 5000,
				events: ['event'],
			});
		}
	}
	start() {
		for (var url in this.list) {
			this.urlmon[url] = new urm({
				url: url,
				interval: this.interval,
				timeout: this.timeout,
			});

			this.urlmon[url].on('available', data => {
				this.list[data.url] = {
					code: data.code,
					status: 'up',
					time: Date.now(),
				};
			});

			this.urlmon[url].on('unavailable', data => {
				this.list[data.url] = {
					code: data.code,
					status: 'dwon',
					time: Date.now(),
				};
			});

			this.urlmon[url].on('error', data => {
				this.list[data.url] = {
					code: data.code,
					status: 'dwon',
					time: Date.now(),
				};
			});

			this.urlmon[url].start();
		}

		if (this.eventTimer == 'true') {
			this.check.on('event', () => {
				if (this.running == false) {
					this.running = true;
				} else {
					this.emit('change', this.list);
				}
			});

			this.check.start();
		} else {
			this.running = true;
		}
	}

	stop() {
		for (var url in this.list) {
			this.urlmon[url].stop();
			delete this.urlmon[url];
		}

		if (this.eventTimer == 'true') {
			this.check.stop();
			this.check.removeAllListeners('event');
		}

		this.running = false;
	}
}

//------ Inherit from 'events' module
util.inherits(urlk, event);

//----------------------------------------- CLASS

//------ Constructor
class urm {
	constructor(options) {
		this.url = options.url;
		this.interval = options.interval || 5000;
		this.timeout = options.timeout || 3000;
		this.handle = null;
	}
	start() {
		var self = this;

		var timer = function () {
			testUrl.call(self, self.url);
			self.handle = setTimeout(timer, self.interval);
		};

		timer();
	}
	stop() {
		clearTimeout(this.handle);
		this.handle = null;
	}
}

util.inherits(urm, event);

//------ Test url
function testUrl(url) {
	var self = this;
	var obj = urlp.parse(url);
	var req = null;

	if (obj.protocol == 'https:') {
		if (obj.port == null) {
			obj.port = '443';
		}

		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore self-signed certificate error

		req = https.request(
			{
				host: obj.hostname,
				port: obj.port,
				method: 'GET',
				path: obj.path,
				agent: false,
			},
			res => {
				if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
					self.emit('available', message.call(this, url, res.statusCode));
				} else {
					self.emit('unavailable', message.call(this, url, res.statusCode));
				}
			}
		);

		req.setTimeout(self.timeout, function () {
			req.abort();
		});

		req.on('error', function (err) {
			self.emit('error', { code: null, url: url, message: 'Host unavailable' });
		});

		req.end();
	} else if (obj.protocol == 'http:') {
		if (obj.port == null) {
			obj.port = '80';
		}

		req = http.request(
			{
				host: obj.hostname,
				port: obj.port,
				method: 'GET',
				path: obj.path,
				agent: false,
			},
			res => {
				if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
					self.emit('available', message.call(this, url, res.statusCode));
				} else {
					self.emit('unavailable', message.call(this, url, res.statusCode));
				}
			}
		);

		req.setTimeout(self.timeout, function () {
			req.abort();
		});

		req.on('error', function (err) {
			self.emit('error', { code: null, url: url, message: 'Host unavailable' });
		});

		req.end();
	} else {
		self.emit('error', { code: null, url: url, message: 'Unknown protocol (http & https only)' });
	}
}

function message(url, code) {
	var res = null;

	if (code != null) {
		res = {
			code: code,
			url: url,
			message: HTTPStatus[code],
		};
	} else {
		res = {
			code: null,
			url: url,
			message: 'Unknown error',
		};
	}

	return res;
}

function monitor() {
	setInterval(async () => {
		const checks = await Check.find();

		urls = checks.map(check => {
			return check.url;
		});

		var monitor = new urlk({
			interval: 30000,
			timeout: 3000,
			list: urls,
		});

		monitor.on('change', data => {
			console.log(data);
			createReport(data);
		});
		monitor.start();
	}, 1000 * 60);
}

//------ Export module
module.exports = { monitor };
