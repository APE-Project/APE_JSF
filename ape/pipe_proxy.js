var Ape_pipe_proxy = new Class({

	Extends: Ape_pipe,	

	initialize: function(core, options){
		this._core = core || window.Ape;
		this.type = 'proxy';
		if (options) {
			this.init(options);
		}
	},
	init: function(options){
		this.pipe = options.pipe;

		this._core.add_pipe(this.get_pubid(), this);

		this.add_event('raw_proxy_event', this.raw_proxy_event, true);

		this.fire_event('new_pipe_proxy', [this, options]);
		this.fire_event('new_pipe', [this, options]);
	},
	open: function(hostname, port){
		//Adding a callback to request response to create a new pipe
		this.request('PROXY_CONNECT', [hostname,port], true, {'callback':this.pipe ? null : this.callback.bind(this)});
	},
	send: function(data){
	      this.request('PROXY_WRITE',[this.get_pubid(),B64.encode(data)]);
	},
	raw_proxy_event: function(resp, pipe){
		if(!this.pipe) this.init(resp.datas);
		switch (resp.datas.event) {
			case 'READ':
				var data = B64.decode(resp.datas.data)
				this.fire_event('proxy_read',data);
				if(this.onread) this.onread(data);
				break;
			case 'CONNECT':
				this.fire_event('proxy_connect');
				if(this.onopen) this.onopen();
				break;
			case 'CLOSE':
				this.fire_event('proxy_close');
				if(this.onclose) this.onclose();
				break;
		}
	},
	callback: function(raw){
		if(raw.raw=='PROXY') this.init(raw.datas);
	},
	raw_proxy: function(pipe,resp){
		if(!this.pipe) this.init(resp.datas);
	}
});
