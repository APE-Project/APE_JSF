APE.Request = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = new APE.Request.Stack(ape);
		this.cycledStack = new APE.Request.CycledStack(ape);
		//Fix presto bug (see request method)
		if (Browser.Engine.presto){
			this.requestVar = {
				updated: false,
				args: []
			};
			this.requestObserver.periodical(10, this);
		}
	},
	setOptions: function(options) {
		this.options = options;
	},

	send: function(cmd, params, sessid, noWatch) {
		//Opera dirty fix
		if (Browser.Engine.presto && !noWatch) {
			this.requestVar.updated = true;
			this.requestVar.args.push([cmd, param, sessid, options]);
			return;
		}

		this.options = $extend({
			event: true,
			callback: null
		}, this.options);

		this.ape.transport.send(this.parseCmd(cmd, params, sessid), this.options, noWatch);

		this.ape.pollerObserver = this.ape.poller.delay(this.ape.options.pollTime, this.ape);

		this.options = null;
	},

	parseCmd: function(cmd, params, sessid) {
		var queryString = '';
		var a = [];
		var o = {};
		if ($type(cmd) == 'array') {
			var tmp;
			for (var i = 0; i < cmd.length; i++) {
				tmp = cmd[i];
				o.cmd = tmp.cmd;
				tmp.params ? o.params = tmp.params : null;
				if (sessid !== false) o.sessid = this.ape.getSessid();
				a.push(o);
				if (this.options.event) this.ape.fireEvent('cmd_' + tmp.cmd.toLowerCase(), params);
				o = {};
			}
		} else {
			o.cmd = cmd;
			params ? o.params = params : null;
			if (sessid || !typeof(sessid)) o.sessid = this.ape.getSessid();
			a.push(o);
			if (this.options.event) this.ape.fireEvent('cmd_' + cmd.toLowerCase(), params);
		}
		return JSON.encode(a);
	},

	/****
	 * This method is only used by opera.
	 * Opera have a bug, when request are sent trought user action (ex : a click), opera throw a security violation when trying to make a XHR.
	 * The only way is to set a class var and watch when this var change
	 */
	requestObserver: function(){
		if (this.requestVar.updated) {
			var args = this.requestVar.args.shift();
			this.requestVar.updated = (this.requestVar.args.length>0) ? true : false;
			args[4] = true; //Set noWatch argument to true
			this.send.run(args, this);
		}
	}
});
