var Ape_events = new Class({
	fire_event: function(type,args,delay){
		this._core.fireEvent(type,args,delay);
	},
	add_event: function(type,fn,no_bind,internal){
		no_bind ? this._core.addEvent(type,fn,internal) : this._core.addEvent(type,fn.bind(this),internal); 
	},
	remove_event: function(type,fn){
		this._core.removeEvent(type,fn);
	},
});
