var APE_Events = new Class({

	Extends: Events,

	fireEvent: function(type, args, delay){
		if (type.test('^pipe:')) { 
			this.parent(type.substring(5), args, delay) 
		} else {
			this.core.fireEvent(type, args, delay);
		}
	},

	addEvent: function(type, fn, internal){
		if (type.test('^pipe:')) {
			this.parent(type.substring(5), fn, internal)
		} else {
			this.core.addEvent(type, fn, internal);
		}
	},

	onRaw: function(type, fn, internal) {
		this.addEvent(type.test('^pipe:') ? 'pipe:raw_' + type.substring(5) : 'raw_' + type, fn, internal);
	},                                                                     
                                                                           
	onCmd: function(type, fn, internal) {                                  
		this.addEvent(type.test('^pipe:') ? 'pipe:cmd_' + type.substring(5) : 'cmd_' + type, fn, internal);
	},                                                                     
                                                                           
	onError: function(type, fn, internal) {                                
		this.addEvent(type.test('^pipe:') ? 'pipe:err_' + type.substring(5) : 'err_' + type, fn, internal);
	}
});
