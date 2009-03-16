var 	Ape_config = new Array(),
	Ape_client = new Class({
	fire_event: function(type,args,delay){
		this._core.fireEvent(type,args,delay);
	},
	add_event: function(type,fn,internal){
		this._core.addEvent(type,fn.bind(this),internal);
	},
	load: function(config){
		config.identifier = config.identifier || 'ape';
		config.init_ape = config.init_ape || true;

		var 	tmp 	= JSON.decode(Cookie.read('Ape_cookie')),
			restore = Cookie.read('Ape_restore');

		config.frequency = config.frequency || 0;
		if(tmp){
			config.frequency = tmp.frequency.toInt();
		}
		if(restore){
			config.frequency = restore;
			config.direct_restore = true;
		}
		config.init = function(core){
			this._core = core;
		}.bind(this);
		document.domain = config.domain;
		Ape_config[config.identifier] = config;
		var iframe = new Element('iframe',{
			'id':'ape_'+config.identifier,
			'styles':{
				'display':'none',
				'position':'absolute',
				'left':'-300px',
				'top':'-300px'
			},
			'src':'http://'+config.frequency+'.'+config.server+'/?q&script&'+config.scripts.join('&')+'&ac'
		}).inject(document.body);
	}
});
