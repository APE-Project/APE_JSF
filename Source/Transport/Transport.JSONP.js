APE.Transport.JSONP = new Class({
	
	Implements: APE.Transport.SSE,

	initialize: function(ape) {
		this.ape = ape;
		this.requestFailObserver = [];
		this.requests = [];
		
		//If browser support servent sent event, switch to SSE / JSONP transport  (not yet supported by APE server)
		//if (this.SSESupport) this.ape.options.transport = 3;
		
		window.parent.onkeyup = function(ev) {
			if (ev.keyCode == 27) {
				this.cancel();//Escape key
				if (this.ape.status > 0) {
					//if (!this.SSESupport) 
					//this.ape.request('CLOSE');
					this.ape.check();
				}
			}
		}.bind(this);
	},

	send: function(queryString, options) {
		//Opera has some trouble with JSONP, so opera use mix of SSE & JSONP
		/*if (this.SSESupport && !this.eventSource) { //SSE not yet supported by APE server
			this.initSSE(queryString, options, this.readSSE.bind(this));
		} else { */
			this.callback = options.requestCallback;

			var request = document.createElement('script');
			request.src = 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/' + this.ape.options.transport +'/?' + queryString;
			document.head.appendChild(request);
			this.requests.push(request);
			//Detect timeout
			this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [-1, request]));

			if (Browser.Engine.gecko) {
				//Firefox hack to avoid status bar always show a loading message
				//Ok this hack is little bit weird but it works!
				(function() {
					var tmp = document.createElement('iframe');
					document.body.appendChild(tmp);
					document.body.removeChild(tmp);
				}).delay(200);
			}
		//}
	},

	clearRequest: function(request) {
		request.parentNode.removeChild(request);
		//Avoid memory leaks
		if (request.clearAttributes) {
			request.clearAttributes();
		} else { 
			for (var prop in request) delete request[prop];
		}
		$clear(this.requestFailObserver.shift());
	},

	readSSE: function(data) {
		this.ape.parseResponse(data, this.callback);
		this.callback = null;
	},

	read: function(resp) {
		$clear(this.requestFailObserver.shift());
		this.clearRequest(this.requests.shift());
		this.ape.parseResponse(resp, this.callback);
		this.callback = null;
	},

	cancel: function() {
		if (this.requests.length > 0) {
			this.clearRequest(this.requests.shift());
		}
	},

	running: function() {
		/* if (this.SSESupport) {
			return this.eventSource ? true : false;
		} else { */
			return this.requests.length > 0 ? true : false;
		//}
	}

	
});

APE.Transport.JSONP.browserSupport = function() { return true };
