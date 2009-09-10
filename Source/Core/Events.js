var APE = {
	Request: {},
	Transport: {}
};
APE.Events = new Class({
	
	Extends: Events,
		
	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type, fn, internal);
	},
	
	onCmd: function(type, fn, internal) {                                  
		return this.addEvent('cmd_' + type, fn, internal);
	},
	
	onError: function(type, fn, internal) {                                
		return this.addEvent('error_' + type, fn, internal);
	}
	
});
