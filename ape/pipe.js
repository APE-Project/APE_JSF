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
	request: function(raw, param, sessid, options){
		var tmp = {'event': false}, event_param = param;

		this._core.request(raw, param, sessid, options ? $extend(tmp, options) : tmp);
		if (!$type(sessid) || sessid) {
			//I know i would be better to use param.unshift but when i did it opera get some trouble (try it yourself if you want to know what happend)
			event_param = [this._core.get_sessid()].combine(param);
		}
		this.fire_event('cmd_' + raw.toLowerCase(), [this].combine(event_param));
	},
	get_pubid: function(){
		return this.pipe.pubid;
	}
});
