var APEConfig = new Array();
function APEClient(core){
	this._core = core;
}
APEClient.prototype.fireEvent = function(type, args, delay){
	this._core.fireEvent(type,args,delay);
}
APEClient.prototype.addEvent = function(type, fn, no_bind, internal){
	no_bind ? this._core.addEvent(type, fn, internal) : this._core.addEvent(type, fn.bind(this), internal); 
}
APEClient.prototype.apeCookie = function (name, remove) {
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

APEClient.prototype.load = function(config){
	this.config = config;
	config.init = config.init || true;
	var tmp = eval('('+unescape(this.apeCookie('APECookie'))+')');
	config.frequency = config.frequency || 0;
	config.init = function(core){
		this._core = core;
	}.bind(this);
	document.domain = config.domain;
	var frame = document.createElement('iframe');
	frame.setAttribute('id','ape_' + config.identifier);
	frame.style.display = 'none';
	frame.style.position = 'absolute';
	frame.style.left = '-300px';
	frame.style.top = '-300px';
	APEConfig[config.identifier] = config;
	document.body.appendChild(frame);
	frame.setAttribute('src','http://'+config.frequency+'.'+config.server+'/?script&'+config.scripts.join('&')+'&ac');
}
if(Function.prototype.bind==null){
	Function.prototype.bind = function(bind,args){
		return this.create({bind: bind,arguments:args});
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
