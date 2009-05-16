var APE_Config = new Array();

var	APE_Client = new Class({
	fireEvent: function(type, args, delay){
		this.core.fireEvent(type, args, delay);
	},

	addEvent: function(type, fn, no_bind, internal){
		no_bind ? this.core.addEvent(type,fn,internal) : this.core.addEvent(type,fn.bind(this),internal); 
	},

	onRaw: function(type, fn, no_bind, internal) {
		this.addEvent('raw_' + type, fn, no_bind, internal); 
	},

	onCmd: function(type, fn, no_bind, internal) {
		this.addEvent('cmd_' + type, fn, no_bind, internal); 
	},

	onError: function(type, fn, no_bind, internal) {
		this.addEvent('err_' + type, fn, no_bind, internal); 
	},

	load: function(config){
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
	}
});
