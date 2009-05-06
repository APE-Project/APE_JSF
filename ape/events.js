var APEEvents = new Class({

	Extends: Events,

	fireEvent: function(type, args, pipe, delay){
		pipe ? this.parent(type, args, delay) : this._core.fireEvent(type, args, delay);
	},
	addEvent: function(type, fn, pipe, internal){
		pipe ? this.parent(type, fn, internal) : this._core.addEvent(type, fn, internal);
	}
});
