APE.Request.CycledStack = new Class({
	initialize: function(ape) {
		this.ape = ape;

		this.stack = [];
		this.reajustTime = false;

		this.timer = this.send.periodical(this.ape.options.cycledStackTime, this);
	},

	add: function(cmd, params, sessid) {
		this.stack.push({'cmd':cmd, 'params':params, 'sessid':sessid});
	},

	setTime: function(time, now) {
		if (now) {
			this.send();
			$clear(this.timer);
			this.timer = this.send.periodical(time, this);
			this.reajustTime = false;
		}
		else this.reajustTime = time;
	},

	send: function() {
		if (this.stack.length > 0) {
			this.ape.request.send(this.stack);
			this.stack = [];
			if (this.reajustTime) {
				this.setTime(this.reajustTime, true);
			}
		}
	}
});
