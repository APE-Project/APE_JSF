var APE_Events = new Class({

	Extends: Events,

	fireEvent: function(type, args, pipe, delay){
		pipe ? this.parent(type, args, delay) : this.core.fireEvent(type, args, delay);
	},
	addEvent: function(type, fn, pipe, internal){
		pipe ? this.parent(type, fn, internal) : this.core.addEvent(type, fn, internal);
	},
	onRaw: function(type, fn, pipe, internal) {
		this.addEvent('raw_' + type, fn, pipe, internal);
	},
	onCmd: function(type, fn, pipe, internal) {
		this.addEvent('cmd_' + type, fn, pipe, internal);
	},
	onError: function(type, fn, pipe, internal) {
		this.addEvent('err_' + type, fn, pipe, internal);
	}
});
