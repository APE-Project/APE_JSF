APE.Pipe  = new Class({

	Implements: APE.Events,

	initialize: function(ape, options){
	console.log(options);
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
				send: this.ape.request.send
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
			return args;
	},

	send: function(data){
		this.request.send('SEND', {'msg': escape(data)});
	},

	getPubid: function(){
		return this.pipe.pubid;
	},

	fireGlobalEvent: function(type, fn, internal) {
		this.fireEvent(type, fn, internal);
		this.ape.fireEvent(type, fn, internal);
	},

	fireInTheHall: this.fireGlobalEvent

});
