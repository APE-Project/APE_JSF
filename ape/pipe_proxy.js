var Ape_pipe_proxy = new Class({

	Extends: Ape_pipe,	

	initialize: function(core, options){
		this._core = core || window.Ape;
		this.type = 'proxy';
		if (options) {
			this.init(options);
		} 

		this.add_event('raw_proxy', this.raw_proxy);
	},
	init: function(options){
		this.pipe = options.pipe;

		this._core.add_pipe(this.get_pubid(), this);

		this.add_event('raw_proxy_event',this.raw_proxy_event);

		this.fire_event('new_pipe_proxy',[this,options]);
		this.fire_event('new_pipe',[this,options]);
	},
	open: function(hostname, port){
		this.request('PROXY_CONNECT',[hostname,port]);
	},
	send: function(data){
		console.log('send',data);
	      this.request('PROXY_WRITE',[this.get_pubid(),B64.encode(data)]);
	},
	raw_proxy_event: function(pipe, resp){
		if(!this.pipe) this.init(resp.datas);
		switch (resp.datas.event) {
			case 'READ':
				var data = B64.decode(resp.datas.data)
				this.fire_event('proxy_read',pipe,data);
				console.log('read',data);
				if(this.onread){
				this.onread(data);
				console.log('on read executed');
				}
				break;
			case 'CONNECT':
				this.fire_event('proxy_connect',pipe);
				if(this.onopen) this.onopen();
				break;
			case 'CLOSE':
				this.fire_event('proxy_close',pipe);
				if(this.onclose) this.onclose();
				break;
		}
	},
	raw_proxy: function(pipe,resp){
		if(!this.pipe) this.init(resp.datas);
	}
});
