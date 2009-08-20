APE.Request.CycledStack = new Class({
	initialize: function(ape) {
		this.ape = ape;

		this.stack = [];
		this.timer = false; 
	},

	add: function(cmd, params, sessid) {
		if (!this.timer) this.timer = this.send.delay(this.ape.options.cycledStackTime, this);
		this.stack.push({'cmd':cmd, 'params':params, 'sessid':sessid});
	},
	send: function() {
		console.log('sending stack');
		this.ape.request.send(this.stack);
		$clear(this.timer);
		this.timer = false;
		this.stack = [];
	}
});
