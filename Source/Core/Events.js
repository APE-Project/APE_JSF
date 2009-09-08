APE.Events = new Class({
	
	Extends: Events,
	
	fireEvent: function(type, args, delay) {
		// Events.prototype.fireEvent is used instead of this.parent, see bug : #673 
		// https://mootools.lighthouseapp.com/projects/2706/tickets/673
		if (type.test(/^pipe:/)) return Events.prototype.fireEvent.call(this, type.substring(5), args, delay);
		else return this.ape.fireEvent(type, args, delay);
	},
	
	addEvent: function(type, fn, internal) {
		if (type.test(/^pipe:/)) return Events.prototype.addEvent.call(this, type.substring(5), fn, internal);
		else return this.ape.addEvent(type, fn, internal);
	},
	
	onRaw: function(type, fn, internal) {
		return this.addEvent(type.test(/^pipe:/) ? 'pipe:raw_' + type.substring(5) : 'raw_' + type, fn, internal);
	},
	
	onCmd: function(type, fn, internal) {                                  
		return this.addEvent(type.test(/^pipe:/) ? 'pipe:cmd_' + type.substring(5) : 'cmd_' + type, fn, internal);
	},
	
	onError: function(type, fn, internal) {                                
		return this.addEvent(type.test(/^pipe:/) ? 'pipe:error_' + type.substring(5) : 'error_' + type, fn, internal);
	}
	
});
