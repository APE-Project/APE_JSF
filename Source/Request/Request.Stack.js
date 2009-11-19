APE.Request.Stack = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack =[];
	},
	add: function(cmd, params, options) {
		this.stack.push({'cmd':cmd, 'params':params, 'options': options});
	},
	send: function() {
		this.ape.request.send(this.stack);
		this.stack = [];
	}
});
