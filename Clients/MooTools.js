var APE = {
	Config: {
		identifier: 'ape',
		init: true,
		frequency: 0,
		scripts: []
	}
};

APE.Client = new Class({
	
	eventProxy: [],

	fireEvent: function(type, args, delay){
		return this.core.fireEvent(type, args, delay);
	},

	addEvent: function(type, fn, internal){
		var newFn = fn.bind(this), ret = this;
		if(!$defined(this.core)) this.eventProxy.push([type, fn, internal]);
		else {
			ret = this.core.addEvent(type, newFn, internal);
			this.core.$originalEvents[type] = this.core.$originalEvents[type] || [];
			this.core.$originalEvents[type][fn] = newFn;
			delete this.core.$originalEvents[type][fn];
		}
		return ret;
	},

	onRaw: function(type, fn, internal){
		return this.addEvent('raw_' + type, fn, internal); 
	},

	removeEvent: function(type, fn) {
		this.core.removeEvent(type, this.core.$originalEvents[type][fn]);
	},

	onCmd: function(type, fn, internal){
		return this.addEvent('cmd_' + type, fn, internal); 
	},

	onError: function(type, fn, internal){
		return this.addEvent('error_' + type, fn, internal); 
	},

	load: function(config){
		var tmp	= JSON.decode(Cookie.read('APE_Cookie'));
		
		config = $merge({}, APE.Config, config);

		// Init function called by core to init core variable
		config.init = function(core){
			this.core = core;
			for(var i = 0; i < this.eventProxy.length; i++){
				this.addEvent.apply(this, this.eventProxy[i]);
			}
		}.bind(this);
		
		
		if(tmp) config.frequency = tmp.frequency.toInt();
		
		APE.Config[config.identifier] = config;
		var iframe = new Element('iframe', {
			id: 'ape_' + config.identifier,
			styles: {
				display: 'none',
				position: 'absolute',
				left: -300,
				top: -300
			}
		}).inject(document.body);

		if (config.transport == 2) {//Special case for JSONP
			//I know this is dirty, but it's the only way to avoid status bar loading with JSONP
			//If the content of the iframe is created in DOM, the status bar will always load...
			iframe.contentDocument.open();
			var theHtml = '<html><head></head>';
			for (var i = 0; i < config.scripts.length; i++) {
				theHtml += '<script src="' + config.scripts[i] + '"></script>';
			}
			theHtml += '<body></body></html>';
			iframe.contentDocument.write(theHtml);
			iframe.contentDocument.close();
		} else { 
			document.domain = config.domain;
			iframe.set('src', 'http://' + config.frequency + '.' + config.server + '/?[{"cmd":"script","params":{"scripts":["' + config.scripts.join('","') + '"]}}]');
			// Firefox fix, see bug  #356558 
			// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
			iframe.contentWindow.location.href = iframe.get('src');
		}	
		
		return this;
	}
	
});
