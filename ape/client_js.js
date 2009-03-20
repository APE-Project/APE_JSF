var Ape_config = new Array();
function Ape_client(core){
	this._core = core;
}
Ape_client.prototype.fire_event = function(type,args,delay){
	this._core.fireEvent(type,args,delay);
}
Ape_client.prototype.add_event = function(type,fn,internal){
	this._core.addEvent(type,fn,internal);
}
Ape_client.prototype.ape_cookie = function (name,remove) {
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

Ape_client.prototype.load = function(config){
	this.ape_config = config;
	config.init_ape = config.init_ape || true;
	var tmp = eval('('+unescape(this.ape_cookie('Ape_cookie'))+')');
	config.frequency = config.frequency || 0;
	if(tmp){
		config.frequency = parseInt(tmp.frequency);
	}
	var restore = this.ape_cookie('Ape_restore')
	if(restore){
		config.frequency = restore;
		config.direct_restore = true;
	}
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
	Ape_config[config.identifier] = config;
	document.body.appendChild(frame);
	frame.setAttribute('src','http://'+config.frequency+'.'+config.server+'/?q&script&'+config.scripts.join('&')+'&ac');
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
