APE.Request = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = new APE.Request.Stack(ape);
		this.cycledStack = new APE.Request.CycledStack(ape);
		this.options = {};
		this.chl = 0;

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
		this.options = $merge(options, this.options);
	},

	send: function(cmd, params, sessid, noWatch) {
		//Opera dirty fix
		if (Browser.Engine.presto && !noWatch) {
			this.requestVar.updated = true;
			this.requestVar.args.push([cmd, param, sessid, options]);
			return;
		}

		this.options = $merge({
			event: true,
			callback: null
		}, this.options);

		this.ape.transport.send(this.parseCmd(cmd, params, sessid), this.options, noWatch);

		$clear(this.ape.pollerObserver);
		this.ape.pollerObserver = this.ape.poller.delay(this.ape.options.pollTime, this.ape);

		this.options = {};//Reset options
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
				o.chl = this.chl++;

				tmp.params ? o.params = tmp.params : null;
				if (sessid !== false) o.sessid = this.ape.getSessid();
				a.push(o);

				var ev = 'cmd_' + tmp.cmd.toLowerCase();

				if (this.options.event) {
					//Request is on a pipe, fire the event on the core & on the pipe
					if (params && params.pipe) {
						var pipe = this.ape.getPipe(params.pipe);
						params = [pipe, params];
						pipe.fireEvent(ev, params);
					}
					this.ape.fireEvent(ev, params);
				}
			}
		} else {
			o.cmd = cmd;
			o.chl = this.chl++;

			params ? o.params = params : null;
			if (sessid || sessid !== false) o.sessid = this.ape.getSessid();
			a.push(o);
			var ev = 'cmd_' + cmd.toLowerCase();

			if (this.options.event) {
				//Request is on a pipe, fire the event on the core & on the pipe
				if (params && params.pipe) { 
					var pipe = this.ape.getPipe(params.pipe);
					params = [pipe, params];
					pipe.fireEvent(ev, params);
				}
				this.ape.fireEvent(ev, params);
			}
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
