var APE_Config = new Array();

var	APE_Client = new Class({
	fireEvent: function(type, args, delay){
		return this.core.fireEvent(type, args, delay);
	},

	addEvent: function(type, fn, internal){
		return this.core.addEvent(type,fn.bind(this),internal); 
	},

	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type, fn, internal); 
	},

	onCmd: function(type, fn, internal) {
		return this.addEvent('cmd_' + type, fn, internal); 
	},

	onError: function(type, fn, internal) {
		return this.addEvent('error_' + type, fn, internal); 
	},

	load: function(config) {
		var tmp	= JSON.decode(Cookie.read('APE_Cookie'));

		config.identifier = config.identifier || 'ape';
		config.init = config.init || true;
		config.frequency = config.frequency || 0;

		//Init function called by core to init core variable
		config.init = function(core){
			this.core = core;
		}.bind(this);

		document.domain = config.domain;

		if (tmp) {
			config.frequency = tmp.frequency.toInt();
		}
		APE_Config[config.identifier] = config;
		var iframe = new Element('iframe', {
			'id':'ape_' + config.identifier,
			'styles': {
				'display': 'none',
				'position': 'absolute',
				'left': '-300px',
				'top': '-300px'
			}
		}).inject(document.body);
		iframe.set('src', 'http://' + config.frequency + '.' + config.server + '/?script&' + config.scripts.join('&') + '&' + $time());
		//Firefox fix, see bug  #356558 
		// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
		iframe.contentWindow.location.href = iframe.get('src');
	}
});
