var Ape_events = new Class({

	Implements: Events,

	fire_event: function(type, args, pipe, delay){
		pipe ? this.fireEvent(type, args, delay) : this._core.fireEvent(type, args, delay);
	},
	add_event: function(type, fn, pipe, no_bind, internal){
		no_bind ? fn = fn : fn = fn.bind(this);
		pipe ? this.addEvent(type, fn, internal) : this._core.addEvent(type, fn, internal);
	}
});
