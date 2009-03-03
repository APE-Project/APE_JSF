var Ape_pipe  = new Class({
	Implements: Ape_events,
	initialize: function(core,options){
		this.pipe = options.pipe;
		this._core = core;
		this._core.add_pipe(this.get_pubid(),this);
	},
	send: function(message){
		this.request('SEND',[this._core.get_sessid(),this.get_pubid(),escape(message)]);
	},
	request: function(raw,param){
		this._core.request(raw,param,{'event':false});
		param = [this].combine(param);
		this.fire_event('raw_'+raw.toLowerCase(),[this].combine(param));
	},
	get_pubid: function(){
		return this.pipe.pubid;
	}
});
