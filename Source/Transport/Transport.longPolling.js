Request = new Class({

	Extends: Request,

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

	send: function(queryString, options, args) {
		var request = new Request({
			url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/?',
			headers:{'User-Agent':null, 'Accept':null, 'Keep-Alive':null,'Connection':null},
			onFailure: this.ape.requestFail.bind(this.ape, [args, -2, this]),
			onComplete: function(resp) {
				$clear(this.requestFailObserver.shift());
				this.ape.parseResponse(resp, options.callback);
			}.bind(this)
		}).send(queryString);

		this.request = request;

		this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [arguments, -1, request]));

		return request;
	},

	running: function() {
		return this.request ? this.request.running : false;
	},

	cancel: function() {
		this.request.cancel();
		$clear(this.requestFailObserver.shift());
	}
});

APE.Transport.longPolling.browserSupport = function() { return Browser.Features.xhr ? true : 2; };
