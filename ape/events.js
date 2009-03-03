var Ape_events = new Class({
	fire_event: function(type,args,delay){
		this._core.fireEvent(type,args,delay);
	},
	add_event: function(type,fn,internal){
		this._core.addEvent(type,fn.bind(this),internal);
	}
});
