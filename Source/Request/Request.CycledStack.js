APE.Request.CycledStack = new Class({
	initialize: function(ape) {
		this.ape = ape;

		this.timer = this.send.periodical(this.ape.options.cycledStackTime, this);

		this.stack = [];
	},

	add: function(cmd, params, sessid) {
		this.stack.push({'cmd':cmd, 'params':params, 'sessid':sessid});
	},
	send: function() {
		if (this.stack.length > 0) {
			console.log('sending stack');
			this.ape.request.send(this.stack);
			this.stack = [];
		}
	}
});
