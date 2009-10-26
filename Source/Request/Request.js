APE.Request = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = new APE.Request.Stack(ape);
		this.cycledStack = new APE.Request.CycledStack(ape);
		this.options = {};
		this.chl = 1;
		this.callbackChl = new $H;

		//Fix presto bug (see send method)
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

	send: function(cmd, params, sessid, options, noWatch) {
		if (this.ape.requestDisabled) return;
		//Opera dirty fix
		if (Browser.Engine.presto && !noWatch) {
			this.requestVar.updated = true;
			this.requestVar.args.push([cmd, params, sessid, options]);
			return;
		}

		this.options = $merge({
			event: true,
			callback: null
		}, this.options);

		var ret = this.ape.transport.send(this.parseCmd(cmd, params, sessid, options), this.options, noWatch);

		$clear(this.ape.pollerObserver);
		this.ape.pollerObserver = this.ape.poller.delay(this.ape.options.pollTime, this.ape);

		this.options = {};//Reset options

		return ret;
	},

	parseCmd: function(cmd, params, sessid, options) {
		var queryString = '';
		var a = [];
		var o = {};
		if ($type(cmd) == 'array') {
			var tmp, evParams;
			for (var i = 0; i < cmd.length; i++) {
				tmp = cmd[i];

				o = {};
				o.cmd = tmp.cmd;
				o.chl = this.chl++;

				tmp.params ? o.params = tmp.params : null;
				evParams = $extend({}, o.params);

				this.escapeParams(o.params);

				if (!$defined(tmp.sessid) || tmp.sessid !== false) o.sessid = this.ape.getSessid();
				a.push(o);

				var ev = 'cmd_' + tmp.cmd.toLowerCase();
				if (tmp.options && tmp.options.callback) this.callbackChl.set(o.chl, tmp.options.callback);
				if (this.options.event) {
					//Request is on a pipe, fire the event on the core & on the pipe
					if (o.params && o.params.pipe) {
						var pipe = this.ape.getPipe(o.params.pipe);
						evParams = [pipe, evParams];
						pipe.fireEvent(ev, evParams);
					}
					this.ape.fireEvent(ev, evParams);
				}
			}
		} else {
			o.cmd = cmd;
			o.chl = this.chl++;

			params ? o.params = params : null;
			var evParams = $extend({}, params);

			this.escapeParams(params);

			if (!$defined(sessid) || sessid !== false) o.sessid = this.ape.getSessid();
			a.push(o);
			
			var ev = 'cmd_' + cmd.toLowerCase();
			if (options && options.callback) this.callbackChl.set(o.chl, options.callback);

			if (this.options.event) {
				//Request is on a pipe, fire the event on the pipe
				if (params && params.pipe) { 
					var pipe = this.ape.getPipe(params.pipe);
					if (pipe) {
						evParams = [pipe, evParams];
						pipe.fireEvent(ev, evParams);
					}
				}
				this.ape.fireEvent(ev, evParams);
			}
		}
		return JSON.encode(a);
	},

	escapeParams: function(params) {
		for (var i in params) {
			if (params.hasOwnProperty(i)) {
				if (typeof params[i] == 'string') {
					params[i] = encodeURIComponent(params[i]);
					if (this.ape.options.transport == 2) params[i] = encodeURIComponent(params[i]); //In case of JSONP data have to be escaped two times
				}
				else this.escapeParams(params[i]);
			}
		}
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
			args[3] = true; //Set noWatch argument to true
			this.send.run(args, this);
		}
	}
});
