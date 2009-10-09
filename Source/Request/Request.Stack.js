APE.Request.Stack = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack =[];
	},
	add: function(cmd, params, sessid, options) {
		this.stack.push({'cmd':cmd, 'params':params, 'sessid':sessid, 'options': options});
	},
	send: function() {
		this.ape.request.send(this.stack);
		this.stack = [];
	}
});
