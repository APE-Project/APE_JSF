APE.PipeProxy = new Class({

	Extends: APE.Pipe,

	initialize: function(core, options){
		this.core = core || window.Ape;
		this.type = 'proxy';

		if (options) {
			this.init(options);
		}
	},

	init: function(options){
		this.pipe = options.pipe;

		this.core.addPipe(this.getPubid(), this);

		this.onRaw('pipe:proxy_event', this.rawProxyEvent );
		this.fireEvent('pipeCreate', [this.type, this, options]);
	},

	open: function(hostname, port){
		//Adding a callback to request response to create a new pipe if this.pipe haven't been init
		this.request('PROXY_CONNECT', [hostname, port], true, this.pipe ? null : {'callback': this.callback.bind(this)});
	},

	send: function(data){
	      this.request('PROXY_WRITE', [this.getPubid(), B64.encode(data)]);
	},

	rawProxyEvent: function(resp, pipe){
		if(!this.pipe) this.init(resp.datas);
		switch (resp.datas.event) {
			case 'READ':
				var data = B64.decode(resp.datas.data);
				this.fireEvent('proxyRead', data);
				if (this.onread) this.onread(data);
				break;
			case 'CONNECT':
				this.fireEvent('proxyConnect');
				if (this.onopen) this.onopen();
				break;
			case 'CLOSE':
				this.fireEvent('proxyClose');
				if (this.onclose) this.onclose();
				break;
		}
	},

	callback: function(raw){
		if(raw.raw=='PROXY') this.init(raw.datas);
	}
});
