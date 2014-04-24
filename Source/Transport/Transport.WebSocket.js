/**
 * WebSocket Transport object
 *
 * @name APE.Transport.WebSocket
 * @class
 * @private
 */
APE.Transport.WebSocket = new Class({
	stack: [],
	connRunning: false,
	initialize: function(ape) {
		this.ape = ape;
		this.initWs();
	},
	initWs: function() {
		var uri = (this.ape.options.secure ? 'wss' : 'ws') + '://' + this.ape.options.frequency + '.' + this.ape.options.server + '/' + this.ape.options.transport + '/';
		this.ws = ('MozWebSocket' in window ? new MozWebSocket(uri) : new WebSocket(uri));
		this.connRunning = true;
		this.ws.onmessage = this.readWs.bind(this);
		this.ws.onopen = this.openWs.bind(this);
		this.ws.onclose = this.closeWs.bind(this);
		this.ws.onerror = this.errorWs.bind(this);
	},
	readWs: function(evt) {
		this.ape.parseResponse(evt.data, this.callback);
		this.callback = null;
	},
	openWs: function() {
		if (this.stack.length > 0) {
			for (var i = 0; i < this.stack.length; i++) this.send(this.stack[i].q, this.stack[i].options);
			this.stack.length = 0;
		}
	},
	closeWs: function() {
		this.connRunning = false;
	},
	errorWs: function() {
		this.connRunning = false;
	},
	send: function(queryString, options) {
		if (this.ws.readyState == 1) {
			if (options.requestCallback) this.callback = options.requestCallback;
			this.ws.send(queryString);
		} else {//ws not connect, stack request
			this.stack.push({'q': queryString, 'options': options});
		}
	},
	running: function() {
		return this.connRunning;
	},
	cancel: function() {
		this.ws.close();
	}
});

/**
 * Check if the browser supports WebSocket
 *
 * @name APE.Transport.WebSocket.browserSupport
 * @returns {boolean}
 * @function
 * @private
 */
APE.Transport.WebSocket.browserSupport = function() {
	if ('WebSocket' in window || 'MozWebSocket' in window) return true;
	else return 1;//No websocket support switch to XHRStreaming
};
