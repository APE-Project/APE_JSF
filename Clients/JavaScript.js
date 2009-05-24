var APE = {
	Config: {
		identifier: 'ape',
		init: true,
		frequency: 0,
		scripts: []
	},
	Client: function(core) {
		this.core = core;
	}
}


APE.Client.prototype.fireEvent = function(type, args, delay) {
	this.core.fireEvent(type,args,delay);
}

APE.Client.prototype.addEvent = function(type, fn, internal) {
	this.core.addEvent(type, fn, internal);
}

APE.Client.prototype.onRaw = function(type, fn, no_bind, internal) {
		this.addEvent('raw_' + type, fn, no_bind, internal); 
}

APE.Client.prototype.onCmd = function(type, fn, no_bind, internal) {
		this.addEvent('cmd_' + type, fn, no_bind, internal); 
}

APE.Client.prototype.onError = function(type, fn, no_bind, internal) {
		this.addEvent('error_' + type, fn, no_bind, internal); 
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
	config.init = config.init || true;
	var tmp = eval('('+unescape(this.apeCookie('APE_Cookie'))+')');
	config.frequency = config.frequency || 0;
	config.init = function(core){
		this.core = core;
	}.bind(this);
	document.domain = config.domain;
	var frame = document.createElement('iframe');
	frame.setAttribute('id','ape_' + config.identifier);
	frame.style.display = 'none';
	frame.style.position = 'absolute';
	frame.style.left = '-300px';
	frame.style.top = '-300px';
	APE.Config[config.identifier] = config;
	document.body.appendChild(frame);
	frame.setAttribute('src','http://'+config.frequency+'.'+config.server+'/?script&'+config.scripts.join('&')+'&ac');
	//Firefox fix, see bug  #356558 
	// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
	frame.contentWindow.location.href = frame.getAttribute('src');
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
