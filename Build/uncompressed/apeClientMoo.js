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
		}
		return ret;
	},

	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type.toLowerCase(), fn, internal); 
	},

	removeEvent: function(type, fn) {
		return this.core.removeEvent(type, fn);
	},

	onCmd: function(type, fn, internal) {
		return this.addEvent('cmd_' + type.toLowerCase(), fn, internal); 
	},

	onError: function(type, fn, internal) {
		return this.addEvent('error_' + type, fn, internal); 
	},

	load: function(config){	
		config = $merge({}, APE.Config, config);

		// Init function called by core to init core variable
		config.init = function(core){
			this.core = core;
			for(var i = 0; i < this.eventProxy.length; i++){
				this.addEvent.apply(this, this.eventProxy[i]);
			}
		}.bind(this);

		//set document.domain
		if (config.transport != 2) {
			if (config.domain != 'auto') document.domain = config.domain;
			if (config.domain == 'auto') document.domain = document.domain;
		}
		
		var tmp	= JSON.decode(Cookie.read('APE_Cookie'), {'domain': document.domain});

		if(tmp) {
			config.frequency = tmp.frequency.toInt();
		} else {
			tmp = {'frequency': 0};
		}

		tmp.frequency = config.frequency + 1;

		Cookie.write('APE_Cookie', JSON.encode(tmp), {'domain': document.domain});
		
		var iframe = new Element('iframe', {
			id: 'ape_' + config.identifier,
			styles: {
				display: 'none',
				position: 'absolute',
				left: -300,
				top: -300
			}
		}).inject(document.body);

		iframe.addEvent('load',  function() { 
			if (!iframe.contentWindow.APE) setTimeout(iframe.onload, 100);//Sometimes IE fire the onload event, but the iframe is not loaded -_-
			else iframe.contentWindow.APE.init(config);
		});

		if (config.transport == 2) {//Special case for JSONP
			var doc = iframe.contentDocument;
			if (!doc) doc = iframe.contentWindow.document;

			//If the content of the iframe is created in DOM, the status bar will always load...
			//using document.write() is the only way to avoid status bar loading with JSONP
			doc.open();
			var theHtml = '<html><head>';
			for (var i = 0; i < config.scripts.length; i++) {
				theHtml += '<script src="' + config.scripts[i] + '"></script>';
			}
			theHtml += '</head><body></body></html>';
			doc.write(theHtml);
			doc.close();
		} else { 
			iframe.set('src', (config.secure ? 'https' : 'http') + '://' + config.frequency + '.' + config.server + '/?[{"cmd":"script","params":{"domain":"' + document.domain + '","scripts":["' + config.scripts.join('","') + '"]}}]');
			if (Browser.Engine.gecko) { 
				// Firefox fix, see bug  #356558 
				// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
				iframe.contentWindow.location.href = iframe.get('src');
			}
		}	

	}
	
});

/***
 * APE JSF Setup
 */

APE.Config.baseUrl = 'http://local.ape-project.org/APE_JSF'; //APE JSF 
APE.Config.domain = 'ape-project.org'; 
APE.Config.server = 'ape.local.ape-project.org:6969'; //APE server URL
APE.Config.baseUrl = 'http://ape.home.efyx.io/APE_JSF'; //APE JSF 
APE.Config.domain = 'efyx.io'; 
APE.Config.server = 'ape.home.efyx.io:6969'; //APE server URL
APE.Config.transport = 6;

(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/Source/' + arguments[i] + '.js');
})('mootools-core', 'Core/APE', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Transport/Transport.WebSocket', 'Core/Utility', 'Core/JSON');
