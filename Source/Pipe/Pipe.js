APE.Pipe  = new Class({

	Implements: APE.Events,

	initialize: function(ape, options){
		this.pipe = options.pipe;
		this.properties = options.pipe.properties;

		this.ape = ape;
		
		this.initRequestMethod();

		this.ape.addPipe(this.pipe.pubid, this);
	},

	initRequestMethod: function() {
		this.request = {};
		this.request = {
			send: function() {
				var args = this.parsePipeCmd.apply(this, arguments);
				this.ape.request.send.apply(this.ape.request, args);
			}.bind(this),
			cycledStack: {
				add: function() {
					var args = this.parsePipeCmd.apply(this, arguments);
					this.ape.request.cycledStack.add.apply(this.ape.request.cycledStack, args);
				}.bind(this),
				send: this.ape.request.send,
				setTime: this.ape.request.cycledStack.setTime.bind(this.ape.request.cycledStack)
			},
			stack :  {
				add: function() {
					var args = this.parsePipeCmd.apply(this, arguments);
					this.ape.request.stack.add.apply(this.ape.request.stack, args);
				}.bind(this),
				send: this.ape.request.stack.send.bind(this.ape.request.stack)
			}
		}
	},

	parsePipeCmd: function() {
			//convert arguments to a real array to avoid a bug with firefox see bug #292215  https://bugzilla.mozilla.org/show_bug.cgi?id=292215
			var args = Array.prototype.slice.call(arguments);
			if ($type(arguments[0]) == 'array') {
				for (var i = 0; i < args[0].length; i++) {
					if (!args[0][i].params) args[0][i].params = {};
					if (this.pipe) args[0][i].pipe = this.pipe.pubid;
				}
			} else {
				if (!args[1]) args[1] = {};
				if (this.pipe) args[1].pipe = this.pipe.pubid;
			}
			return args;
	},

	send: function(data){
		this.request.send('SEND', {'msg': data});
	},

	left: function() {
		this.ape.left(this.pipe.pubid);
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
