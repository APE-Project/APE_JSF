var APETest = new Class({
	Implements: Events,
	actions: [],
	client: null,
	initialize: function() {
		this.log = $('log');
		this.addEvent('testComplete', this.runTest);
		this.initTest();
		this.runTest();
	},
	initTest: function() {
		this.addTest('Init', function() {
			this.fireEvent('testComplete', {'sucess': true});
		}.bind(this));
		this.addTest('Loading Client', function() {
				var req = new Request({
					'url': '../../Clients/MooTools.js',
					'method': 'get',
					'evalResponse': true,
					'onComplete': function(resp) {
						if (window.APE) this.fireEvent('testComplete', {'sucess': true});
						else this.fireEvent('testComplete', {'error': 'Can\'t load client, check the file ' + window.location.href.replace('/Tools/Check/', '') + '/Clients/MooTools.js is available'});
					}.bind(this)
				}).send();
		}.bind(this));
		this.addTest('Loading config', function() {
			var req = new Request({
				'url': '../../Demos/config.js',
				'method': 'get',
				'evalResponse': true,
				'onComplete': function() {
					if (APE.Config.baseUrl) {
						var confVal = '';
						for (var key in APE.Config) {
							if (APE.Config.hasOwnProperty(key)) {
								confVal += key + ' : ' + APE.Config[key] + '\n';
							}
						}
						this.fireEvent('testComplete', {'sucess': 'Config values are : <pre>' + confVal + '</pre>'});
					}
					else {
						this.fireEvent('testComplete', {'error': 'Can\'t load client, check the file ' + window.location.href.replace('/Tools/Check/', '') + '/Clients/MooTools.js is readable'});
					}
				}.bind(this)
			}).send();
		}.bind(this));
		this.addTest('Setting document.domain', function() {
				if (APE.Config.domain == 'yourdomain.com') {
					this.fireEvent('testComplete', {'error': 'APE.Config.domain has the default value. Please first edit Demos/config.js with the correct values. APE.Config.domain might be ' + window.location.hostname + ''});
				} else {
					var error = false;
					try {
						if (APE.Config.domain == 'auto') document.domain = document.domain;
						else document.domain = APE.Config.domain;
						error = false;
					} catch (e) {
						error = true;
					}
					if (!error) {
						this.fireEvent('testComplete', {'sucess': true});
					} else {
						this.fireEvent('testComplete', {'error': "Can't set document.domain please check APE.Config.domain value it should be " + window.location.hostname});
					}
				}
		}.bind(this));
		this.addTest('Checking APE.Config.baseUrl', function() {
				var oldAPE = $extend({}, APE);
				var req = new Request({
					'method': 'get',
					'url': APE.Config.baseUrl + '/Source/Core/APE.js',
					'onComplete': function(res) {
						if (req.isSuccess()) {
							var version = APE.version;
							APE = oldAPE;
							this.fireEvent('testComplete', {'sucess': 'APE JSF Version ' + version + ''});
						} else {
							this.fireEvent('testComplete', {'error': 'Your variable APE.Config.baseUrl is wrong in Demos/config.js. Please change it to point to APE JSF directory on your webserver'});
						}
					}.bind(this)
				}).send();
		}.bind(this));
		this.addTest('Contacting APE Server', function() {
			//Registering JSONP reader
			Ape = {
				transport: {
					read: function(res) {
						 var jsonRes = JSON.decode(res)[0];
						 if (jsonRes.data.domain) {
							if (jsonRes.data.domain == document.domain) {
								this.fireEvent('testComplete', {'sucess': 'domain = ' + jsonRes.data.domain + '</i>'});
							} else {
								this.fireEvent('testComplete', {'error': 'document.domain mismatch client is ' + document.domain + ' and server is ' + jsonRes.data.domain + ' value of domain for client and server must be the same. Try with ' + window.location.hostname + ' for both'});
							}
						} else {
							this.fireEvent('testComplete', {'error': 'Connection etablished but something went wrong. Server response is <pre>' + res + '</pre>'});
						}
						$clear(timer);
					}.bind(this)
				}
			};
			new Element('script', {'type': 'text/javascript', 'src': 'http://' + APE.Config.server + '/2/?' + encodeURIComponent('[{"cmd":"setup","params":{"domain":"' + document.domain + '"}}]')}).inject(document.body);
			var timer = (function() {
				this.fireEvent('testComplete', {'error': 'Can\'t contact APE Server. Please check the your APE Server is running and the folowing url is pointing to your APE server : <a href="http://' + APE.Config.server + '" target="_blank">http://' + APE.Config.server + '</a>'});
			 }).delay(1000, this);
		}.bind(this));
		this.addTest('Contacting APE Server (adding frequency)', function() {
			//Registering JSONP reader
			Ape = {
				transport: {
					read: function(res) {
						$clear(timer);
						 var jsonRes = JSON.decode(res)[0];
						 if (jsonRes.data.domain) {
							this.fireEvent('testComplete', {'sucess': true});
						} else {
							this.fireEvent('testComplete', {'error': 'Connection etablished but something went wrong. Server response is <pre>' + res + '</pre>'});
						}
					}.bind(this)
				}
			};
			new Element('script', {'type': 'text/javascript', 'src': 'http://0.' + APE.Config.server + '/2/?' + encodeURIComponent('[{"cmd":"setup","params":{"domain":"' + document.domain + '"}}]')}).inject(document.body);
			var timer = (function() {
				this.fireEvent('testComplete', {'error': 'Can\'t contact APE Server. Please check the folowing url is pointing to your APE server : http://0.' + APE.Config.server + ''});
			 }).delay(1000, this);
		}.bind(this));
		this.addTest('Initializing APE Client', function() {
			this.client = new APE.Client();
			this.client.load();
			this.client.addEvent('load', function() {
				$clear(timer);
				this.fireEvent('testComplete', {'sucess': true});
			}.bind(this));
			var timer = (function() {
				this.fireEvent('testComplete', {'error': 'Can\'t load APE JSF'});
			 }).delay(4000, this);
		}.bind(this));
		this.addTest('Connecting to APE Server', function() {
			this.client.core.start({'name': $time().toString()});
			this.client.addEvent('ready', function() {
				this.fireEvent('testComplete', {'sucess': true});
				$clear(timer);
			}.bind(this));
			var timer = (function() {
				this.fireEvent('testComplete', {'error': 'Can\'t login to APE server'});
			 }).delay(2000, this);
		}.bind(this));
	},
	runTest: function(res) {
		if (res && !res.sucess && res.error) {
			this.newLogResult(res.error, 'error');
			new Element('div', {'html': 'Something went wrong. If you can\'t fix it by yourself post a message on the <a href="http://groups.google.com/group/ape-project/">newsgroups</a> with the output below or join our <a href="irc://irc.freenode.net/ape-project">IRC channel</a>'}).inject(this.log);
		} else {
			if (res && res.sucess) this.newLogResult(res.sucess, 'sucess');
			if (this.actions.length > 0) {
				var action = this.actions.shift();
				this.newLog(action.title);
				action.fn.run();
			} else {
				new Element('div', {
					'styles': {
						'text-align': 'center',
						'font-weight': 'bold',
						'font-size': '13px'
					},
					'text': 'All test done. Now you can play with your APE \\o/'
				}).inject(this.log);
			}
		}
	},
	addTest: function(title, fn) {
		this.actions.push({'fn': fn, 'title': title});
	},
	newLog: function(title) {
		new Element('div', {'class': 'runningTest', 'text': 'Running test : ' + title}).inject(this.log);
	},
	newLogResult: function(res, state) {
		var el = this.log.getLast();
		if (el.hasClass('runningTest')) {
			if (state == 'sucess') el.addClass('sucess');
			else el.addClass('error');
		}
		if (res != true) new Element('div', {'class': 'output', 'html': res}).inject(this.log);
	}
});
