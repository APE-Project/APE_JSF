var Ape_pipe  = new Class({

	Implements: Ape_events,

	initialize: function(core, options){
		this.pipe = options.pipe;
		this._core = core;
		this._core.add_pipe(this.get_pubid(), this);
	},
	send: function(data){
		this.request('SEND',[this.get_pubid(), escape(data)]);
	},
	request: function(raw, param, sessid){
		this._core.request(raw,param,sessid, {'event': false});
		param = [this].combine(param);
		this.fire_event('cmd_' + raw.toLowerCase(), [this].combine(param));
	},
	get_pubid: function(){
		return this.pipe.pubid;
	}
});
