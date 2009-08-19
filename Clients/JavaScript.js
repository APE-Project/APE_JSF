var APE = {
	Config: {
		identifier: 'ape',
		init: true,
		frequency: 0,
		scripts: []
	},

	Client: function(core) {
			if(core) this.core = core;	
	}
	windowLoaded: false;
}

(function() {
	var onload = window.onload;
	var fn = function() {
		APE.windowLoaded = true;
	}
	if (typeof window.onload != 'function'){
		window.onload = fn;
	} else {
		window.onload = function(){
			onload();
			fn();
		};
	}
});

APE.Client.prototype.eventProxy = [];
APE.Client.prototype.fireEvent = function(type, args, delay) {
	this.core.fireEvent(type,args,delay);
}

APE.Client.prototype.addEvent = function(type, fn, internal) {
	var newFn = fn.bind(this), ret = this;
	if(this.core == undefined){
		this.eventProxy.push([type, fn, internal]);
	}else{
		var ret = this.core.addEvent(type, newFn, internal);
		this.core.$originalEvents[type] = this.core.$originalEvents[type] || [];
		this.core.$originalEvents[type][fn] = newFn;
		delete this.core.$originalEvents[type][fn];
	}
	return ret;
}

APE.Client.prototype.onRaw = function(type, fn, internal) {
		this.addEvent('raw_' + type, fn, internal); 
}

APE.Client.prototype.onCmd = function(type, fn, internal) {
		this.addEvent('cmd_' + type, fn, internal); 
}

APE.Client.prototype.onError = function(type, fn, internal) {
		this.addEvent('error_' + type, fn, internal); 
}

APE.Client.prototype.apeCookie = function (name, remove) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0){
			return c.substring(nameEQ.length,c.length);
		}
	}
	return null;
}

APE.Client.prototype.load = function(config){

	this.config = config;

	config.frequency = config.frequency || 0;
	config.domain = config.domain || APE.Config.domain || document.domain;
	config.scripts = config.scripts || APE.Config.scripts;
	config.server = config.server || APE.Config.server;

	config.init = function(core){
		this.core = core;
		for(var i = 0; i < this.eventProxy.length; i++){
			this.addEvent.apply(this, this.eventProxy[i]);
		}
	}.bind(this);

	document.domain = config.domain;

	//Get APE cookie
	var tmp = eval('('+unescape(this.apeCookie('APE_Cookie'))+')');

	var iframe = document.createElement('iframe');
	iframe.setAttribute('id','ape_' + config.identifier);
	iframe.style.display = 'none';
	iframe.style.position = 'absolute';
	iframe.style.left = '-300px';
	iframe.style.top = '-300px';

	APE.Config[config.identifier] = config;

	document.body.appendChild(iframe);

	if (config.transport == 3) {
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
		iframe.setAttribute('src','http://'+config.frequency+'.'+config.server+'/?script&'+config.scripts.join('&')+'&ac');
		//Firefox fix, see bug  #356558 
		// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
		iframe.contentWindow.location.href = iframe.getAttribute('src');
	}
}


if(Function.prototype.bind==null){
	Function.prototype.bind = function(bind, args){
		return this.create({'bind': bind, 'arguments': args});
	}
}
if(Function.prototype.create==null){
	Function.prototype.create = function(options){
			var self = this;
			options = options || {};
			return function(){
				var args = options.arguments || arguments;
				if(args && !args.length){
					args = [args];
				}
				var returns = function(){
					return self.apply(options.bind || null, args);
				};
				return returns();
			};
	}
}
