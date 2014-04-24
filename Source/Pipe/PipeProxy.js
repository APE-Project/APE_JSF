/**
 * ProxyPipe object
 *
 * @name APE.PipeProxy
 * @class
 * @public
 * @augments APE.Pipe
 * @see APE.PipeSingle
 * @see APE.PipeMulti
 * @see APE.Pipe
 * @fires APE.proxyPipeCreate
 */
APE.PipeProxy = new Class({
	Extends: APE.Pipe,
	initialize: function(core, options) {
		this.core = core || window.Ape;
		this.ape = this.core;
		this.initRequestMethod();
		this.type = 'proxy';
		if (options) {
			this.init(options);
		}
	},
	init: function(options) {
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
	/**
	* Open a new proxy connection to a IP:Port
	* <p>This is actually the constructor</p>
	*
	* @name APE.PipeProxy.open
	* @function
	* @public
	*
	* @param {string} host Hostname or ip-address
	* @param {integer} port Port
	* @returns {APE.PipeProxy} a APE.PipeProxy object
	*
	* @example
	* //ape var is a reference to APE instance
	* //Connect to the APE server
	* ape.start();
	* //Connect to proxy when the client is connected to the server
	* ape.addEvent('init', function() {
	* 		//Connect to freenode irc
	* 		var proxy = new APE.PipeProxy();
	* 		proxy.open('irc.freenode.net', 6667);
	* 	});
	* //Intercept proxy event
	* ape.addEvent('proxyConnect', function() {
	* 		console.log('you are now connected to proxy');
	* 	});
	* ape.addEvent('proxyRead', function(data) {
	* 		console.log('Receiving data', data);
	* });
	*/
	open: function(hostname, port) {
		if (this.core.status == 0) this.core.start(null, false);
		//Adding a callback to request response to create a new pipe if this.pipe haven't been init
		this.request.stack.add('PROXY_CONNECT', {'host': hostname, 'port': port}, this.pipe ? {} : {'callback': this.callback.bind(this)});
		this.request.stack.send();
	},
	/**
	* Send data to a proxy
	*
	* @name APE.PipeProxy.send
	* @function
	* @public
	*
	* @param {string} data The data string to send. The data wil be b64 encoded and send with a SEND CMD
	* @returns {void}
	*
	*
	* @example
	* //ape var is a reference to APE instance
	* ape.start();
	* var proxy;
	* ape.addEvent('init', function() {
	* 	//Connect to the APE server
	* 	proxy = new APE.PipeProxy();
	* 	//Connect to ape-project website
	* 	proxy.connect('www.ape-project.org', 80);
	* });
	* //Send HTTP headers
	* proxy.write("GET / HTTP1.1\r\nhost: www.ape-project.org\n\n");
	* ape.addEvent('proxyConnect', function() {
	* 	console.log('you are now connected to proxy');
	* });
	* //Receive the page content
	* ape.addEvent('proxyRead', function(data) {
	* 	console.log('Receiving data', data);
	* });
	* ape.addEvent('proxyClose', function() {
	* 	console.log('Proxy closed the connection');
	* });
	*/
	send: function(data) {
		this.request.send('SEND', {'msg': B64.encode(data)});
	},
	rawProxyEvent: function(resp) {
		switch (resp.data.event) {
			case 'read':
				var data = B64.decode(resp.data.data);
				this.fireGlobalEvent('proxyRead', data);
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
	callback: function(raw) {
		this.init(raw.data);
		this.rawProxyEvent(raw);
	}
});
APE.Core = new Class({
	Extends: APE.Core,
	/**
	 * This allow ape to be compatible with TCPSocket
	 */
	TCPSocket: APE.PipeProxy
});
