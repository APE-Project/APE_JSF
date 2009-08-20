APE.Transport.JSONP = new Class({
	
	Implements: APE.Transport.SSE,

	initialize: function(ape) {
		this.ape = ape;
		this.requestFailObserver = [];
		this.requests = [];
		
		//If browser support servent sent event, switch to SSE / JSONP transport 
		if (this.SSESupport) this.ape.options.transport = 3;
		
		window.parent.onkeyup = function(ev) {
			if (ev.keyCode == 27) {
				this.cancel();//Escape key
				if (this.ape.status > 0) {
					if (!this.SSESupport) this.ape.request('CLOSE');
				}
			}
		}.bind(this);
	},

	send: function(queryString, options, args) {
		console.info('new JSONP', queryString);
		//Opera has some trouble with JSONP, so opera use mix of SSE & JSONP
		if (this.SSESupport && !this.eventSource) {
			this.initSSE(queryString, options, this.readSSE.bind(this));
		} else {
			this.callback = options.callback;

			var request = document.createElement('script');
			request.src = 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/?' + queryString + '&' + $time();
			document.head.appendChild(request);
			this.requests.push(request);
			//Detect timeout
			this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [arguments, -1, request]));

			if (Browser.Engine.gecko) {
				//Firefox hack to avoid status bar always show a loading message
				//Ok this hack is little bit weird but it works!
				(function() {
					var tmp = document.createElement('iframe');
					document.body.appendChild(tmp);
					document.body.removeChild(tmp);
				}).delay(200);
			}
		}
	},

	clearRequest: function(request) {
		console.log('remove script tag');
		request.parentNode.removeChild(request);
		for (var prop in request) delete request[prop];//Avoid memory leaks
		$clear(this.requestFailObserver.shift());
	},

	readSSE: function(data) {
		console.log('SSE Receiving');
		this.ape.parseResponse(data, this.callback);
		this.callback = null;
	},

	read: function(resp) {
		console.log(this.requests);

		$clear(this.requestFailObserver.shift());
		this.clearRequest(this.requests.shift());
		this.ape.parseResponse(resp, this.callback);

		this.callback = null;
	},

	cancel: function() {
		if (this.requests.length > 0) {
			console.log('cancel request');
			this.clearRequest(this.requests.shift());
		}
	},

	running: function() {
		if (this.SSESupport) {
			return this.eventSource ? true : false;
		} else {
			return this.requests.length > 0 ? true : false;
		}
	}

	
});

APE.Transport.JSONP.browserSupport = function() { return true };
