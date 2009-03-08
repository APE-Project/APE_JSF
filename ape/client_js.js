function ape_client(core){
	this._core = core;
}
ape_client.prototype.fire_event = function(type,args,delay){
	this._core.fireEvent(type,args,delay);
}
ape_client.prototype.add_event = function(type,fn,internal){
	this._core.addEvent(type,args,delay);
}
