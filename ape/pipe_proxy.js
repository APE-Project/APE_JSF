var APEPipeProxy = new Class({

	Extends: APEPipe,	

	initialize: function(core, options){
		this._core = core || window.Ape;
		this.type = 'proxy';
		if (options) {
			this.init(options);
		}
	},
	init: function(options){
		this.pipe = options.pipe;

		this._core.addPipe(this.getPubid(), this);

		this.addEvent('raw_proxy_event', this.raw_proxy_event, true);

		this.fireEvent('new_pipe_proxy', [this, options]);
		this.fireEvent('new_pipe', [this, options]);
	},
	open: function(hostname, port){
		//Adding a callback to request response to create a new pipe if this.pipe haven't been initialized
		this.request('PROXY_CONNECT', [hostname,port], true, this.pipe ? null : {'callback':this.callback.bind(this)});
	},
	send: function(data){
	      this.request('PROXY_WRITE',[this.getPubid(),B64.encode(data)]);
	},
	raw_proxy_event: function(resp, pipe){
		if(!this.pipe) this.init(resp.datas);
		switch (resp.datas.event) {
			case 'READ':
				var data = B64.decode(resp.datas.data)
				this.fireEvent('proxy_read',data);
				if(this.onread) this.onread(data);
				break;
			case 'CONNECT':
				this.fireEvent('proxy_connect');
				if(this.onopen) this.onopen();
				break;
			case 'CLOSE':
				this.fireEvent('proxy_close');
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
