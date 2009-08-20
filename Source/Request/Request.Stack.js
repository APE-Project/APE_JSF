APE.Request.Stack = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack =[];
	},
	add: function(cmd, params, sessid) {
		this.stack.push({'cmd':cmd, 'params':params, 'sessid':sessid});
	},
	send: function() {
		this.ape.request.send(this.stack);
		this.stack = [];
	}
});
