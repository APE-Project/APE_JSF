var APEPipe  = new Class({

	Implements: APEEvents,

	initialize: function(core, options){
		this.pipe = options.pipe;
		this._core = core;
		this._core.addPipe(this.getPubid(), this);
	},
	send: function(data){
		this.request('SEND',[this.getPubid(), escape(data)]);
	},
	request: function(raw, param, sessid, options){
		var tmp = {'event': false}, 
			eventParam = param;

		this._core.request(raw, param, sessid, options ? $extend(tmp, options) : tmp);
		if (!$type(sessid) || sessid) {
			//I know i would be better to use param.unshift but when i did it opera get some trouble (try it yourself if you want to know what happend)
			eventParam = [this._core.getSessid()].combine(param);
		}
		this.fireEvent('cmd_' + raw.toLowerCase(), [this].combine(eventParam));
	},
	getPubid: function(){
		return this.pipe.pubid;
	}
});
