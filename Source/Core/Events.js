APE.Events = new Class({
	
	Extends: Events,
		
	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type.toLowerCase(), fn, internal);
	},
	
	onCmd: function(type, fn, internal) {                                  
		return this.addEvent('cmd_' + type.toLowerCase(), fn, internal);
	},
	
	onError: function(type, fn, internal) {                                
		return this.addEvent('error_' + type, fn, internal);
	},

	removeEvent: function(type, fn) {
		return Events.prototype.removeEvent.run([type, this.$originalEvents[type][fn]], this);
	}
	
});
