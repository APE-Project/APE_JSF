APE.PipeProxy = new Class({

	Extends: APE.Pipe,

	initialize: function(core, options){
		this.core = core || window.Ape;
		this.ape = this.core;

		this.initRequestMethod();
		this.type = 'proxy';

		if (options) {
			this.init(options);
		}
	},

	init: function(options){
		this.pipe = options.pipe;

		this.core.addPipe(this.getPubid(), this);

		this.onRaw('proxy_event', this.rawProxyEvent);
		this.ape.fireEvent('proxyPipeCreate', [this, options]);
	},

	reset: function() {
		//close connection
	},

	close: function() {
		//close connection
	},

	open: function(hostname, port){
		if (this.core.status == 0) this.core.start(null, false);
		//Adding a callback to request response to create a new pipe if this.pipe haven't been init
		this.request.stack.add('PROXY_CONNECT', {'host':hostname, 'port':port}, this.pipe ? {} : {'callback':this.callback.bind(this)});
		this.request.stack.send();
	},

	send: function(data){
		this.request.send('SEND', {'msg':B64.encode(data)});
	},

	rawProxyEvent: function(resp){
		switch (resp.data.event) {
			case 'read':
				var data = B64.decode(resp.data.data);
				this.fireGlobalEvent('proxyRead', data)
				if (this.onread) this.onread(data);
				break;
			case 'connect':
				this.fireGlobalEvent('proxyConnect');
				if (this.onopen) this.onopen();
				break;
			case 'close':
				this.fireGlobalEvent('proxyClose');
				if (this.onclose) this.onclose();
				break;
		}
	},

	callback: function(raw){
		this.init(raw.data);
		this.rawProxyEvent(raw);
	}
});

APE.Core = new Class({

	Extends: APE.Core,

	/***
	 * This allow ape to be compatible with TCPSocket
	 */
	TCPSocket: APE.PipeProxy
});
