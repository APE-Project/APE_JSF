APE.Request = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = new APE.Request.Stack(ape);
		this.cycledStack = new APE.Request.CycledStack(ape);
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

	send: function(cmd, params, options, noWatch) {
		if (this.ape.requestDisabled) return;
		//Opera dirty fix
		if (Browser.Engine.presto && !noWatch) {
			this.requestVar.updated = true;
			this.requestVar.args.push([cmd, params, options]);
			return;
		}

		var opt = {};
		if (!options) options = {};

		opt.event = options.event || true;
		opt.requestCallback = options.requestCallback || null;
		opt.callback = options.callback;

		var ret = this.ape.transport.send(this.parseCmd(cmd, params, opt), opt);

		$clear(this.ape.pollerObserver);
		this.ape.pollerObserver = this.ape.poller.delay(this.ape.options.pollTime, this.ape);

		return ret;
	},

	parseCmd: function(cmd, params, options) {
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
				if (!tmp.options) tmp.options = {};

				tmp.params ? o.params = tmp.params : null;
				evParams = $extend({}, o.params);


				if (!$defined(tmp.options.sessid) || tmp.options.sessid !== false) o.sessid = this.ape.sessid;
				a.push(o);

				var ev = 'cmd_' + tmp.cmd.toLowerCase();

				if (tmp.options.callback) this.callbackChl.set(o.chl, tmp.options.callback);
				if (tmp.options.requestCallback) options.requestCallback = tmp.options.requestCallback;
				if (options.event) {
					//Request is on a pipe, fire the event on the pipe
					if (o.params && o.params.pipe) {
						var pipe = this.ape.getPipe(o.params.pipe);
						if (pipe) evParams = [evParams, pipe];
					}

					this.ape.fireEvent('onCmd', evParams);

					if (pipe) pipe.fireEvent(ev, evParams);

					this.ape.fireEvent(ev, evParams);
				}
			}
		} else {
			o.cmd = cmd;
			o.chl = this.chl++;

			params ? o.params = params : null;
			var evParams = $extend({}, params);


			if (!$defined(options.sessid) || options.sessid !== false) o.sessid = this.ape.sessid;
			a.push(o);
			
			var ev = 'cmd_' + cmd.toLowerCase();
			if (options.callback) this.callbackChl.set(o.chl, options.callback);

			if (options.event) {
				//Request is on a pipe, fire the event on the pipe
				if (params && params.pipe) { 
					var pipe = this.ape.getPipe(params.pipe);
					if (pipe) evParams = [evParams, pipe];
				}
				this.ape.fireEvent('onCmd', evParams);

				if (pipe) pipe.fireEvent(ev, evParams);

				this.ape.fireEvent(ev, evParams);
			}
		}

		var transport = this.ape.options.transport;
		return JSON.stringify(a, function(key, value) {
				if (typeof(value) == 'string') {
					value = encodeURIComponent(value);
					//In case of JSONP data have to be escaped two times
					if (transport == 2) value = encodeURIComponent(value);
					return value;
				} else return value;
			});
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
