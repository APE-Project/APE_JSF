Request = new Class({

	Extends: Request,

	send: function(options) {
		//mootools set onreadystatechange after xhr.open, in webkit, this cause readyState 1 to be never fired
		if (Browser.Engine.webkit) this.xhr.onreadystatechange = this.onStateChange.bind(this);
		return this.parent(options);
	},

	onStateChange: function() {
		if (this.xhr.readyState == 1) this.dataSent = true;
		this.parent();
	}
});
APE.Transport.longPolling = new Class({

	initialize: function(ape) { 
		this.ape = ape;
		this.requestFailObserver = [];
	},

	send: function(queryString, options) {
		var request = new Request({
			url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/'+this.ape.options.transport+'/?',
			onFailure: this.ape.requestFail.bind(this.ape, [-2, this]),
			onComplete: function(resp) {
				$clear(this.requestFailObserver.shift());
				this.ape.parseResponse(resp, options.requestCallback);
			}.bind(this)
		}).send(queryString);
		request.id = $time();

		this.request = request;

		this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [-1, request]));

		return request;
	},

	running: function() {
		return this.request ? this.request.running : false;
	},

	cancel: function() {
		if (this.request) this.request.cancel();
		$clear(this.requestFailObserver.shift());
	}
});

APE.Transport.longPolling.browserSupport = function() { return Browser.Features.xhr ? true : 2; };
