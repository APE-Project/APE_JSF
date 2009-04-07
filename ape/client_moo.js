var 	Ape_config = new Array(),
	Ape_client = new Class({
	fire_event: function(type, args, delay){
		this._core.fireEvent(type, args, delay);
	},
	add_event: function(type,fn,no_bind,internal){
		no_bind ? this._core.addEvent(type,fn,internal) : this._core.addEvent(type,fn.bind(this),internal); 
	},
	load: function(config){
		var 	tmp 	= JSON.decode(Cookie.read('Ape_cookie'));

		config.identifier = config.identifier || 'ape';
		config.init_ape = config.init_ape || true;
		config.frequency = config.frequency || 0;

		//Init function called by core to init _core variable
		config.init = function(core){
			this._core = core;
		}.bind(this);

		document.domain = config.domain;

		if (tmp) {
			config.frequency = tmp.frequency.toInt();
		}
		Ape_config[config.identifier] = config;
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
