APE.Pipe  = new Class({

	Implements: APE.Events,

	initialize: function(ape, options){
		this.pipe = options.pipe;
		this.ape = ape;

		this.request = {};


		this.request = {
			send: function() {
				var args = this.parsePipeCmd.apply(this, arguments);
				this.ape.request.send.apply(this.ape.request, args);
			}.bind(this),
			cycledStack: {
				add: function() {
					var args = this.parsePipeCmd.apply(this, arguments);
					this.ape.request.cycledStack.add.apply(this.ape.request, args);
				},
				send: this.ape.request.send.apply(this.ape.request, arguments)
			},
			stack :  {
				add: function() {
					var args = this.parsePipeCmd.apply(this, arguments);
					this.ape.request.stack.add.apply(this.ape.request, args);
				},
				send: this.ape.request.stack.send
			}
		};

		this.ape.addPipe(this.pipe.pubid, this);


/*
		this.request.cycledStack.add = function() {
			this.ape.request.cycledStack.add.pass(this.parsePipeCmd.pass(arguments, this), this);
		}.bind(this);

		this.request.stack.add = function() {
			this.ape.request.stack.add.pass(this.parsePipeCmd.pass(arguments, this), this);
		}.bind(this);
*/
	},

	parsePipeCmd: function() {
			if ($type(arguments[0]) == 'array') {
				var args = arguments;
				for (var i = 0; i < args[0].length; i++) {
					if (!args[0][i].params) args[0][i].params = {};
					args[0][i].pipe = this.pipe.pubid;
				}
			} else {
				var args = arguments;
				if (!args[1]) args[1] = {};
				args[1].pipe = this.pipe.pubid;
			}
			console.log('parse params', args);
			return args;
	},

	send: function(data){
		this.request.send('SEND', {'msg': escape(data), 'pipe': this.pipe.pubid});
	},

	/*function(raw, param, sessid, options){
		var tmp = {event: false}, 
			eventParam = param;

		this.ape.request(raw, param, sessid, options ? $extend(tmp, options) : tmp);
		if (!$type(sessid) || sessid) {
			// I know it would be better to use param.unshift but when i did it opera get some trouble (try it yourself if you want to know what happens)
			eventParam = [this.ape.getSessid()].combine(param);
		}
		this.fireEvent('cmd_' + raw.toLowerCase(), [this].combine(eventParam));
	},*/

	getPubid: function(){
		return this.pipe.pubid;
	}

});
