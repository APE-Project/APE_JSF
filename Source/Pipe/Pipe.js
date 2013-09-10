/**
 * Variable containing pipe options
 * <p>This variable contains the options of a pipe (name, properties, casttype, pubid).</p>
 * <p>The options var passed to pipeCreate event contains the same data as the pipe var.</p>
 *
 * @class Variable containing pipe options
 *
 * @name APE.Pipe
 * @public
 * @namespace
 * @augments-APE.Events
 *
 * @see APE.PipeSingle
 * @see APE.PipeMulti
 * @see APE.PipeProxy
 */

/**
 * @name APE.Pipe.request
 * @property {APE.Request} request request
 * @see APE.request
 */

APE.Pipe = new Class({
	/**
	 * Intercept an event.
	 *
	 * @name APE.Pipe.addEvent
	 * @public
	 * @function
	 *
	 * @param {string} eventName Event if it is send an a pipe
	 * @param {function} fn The function that will be executed upon this named event
	 * @param {boolean} [internal] Flag to hide the function
	 * @returns {APE}
	 *
	 * @example
	 * //ape var is a reference to APE instance
	 * //myPipe var is a reference to a pipe object
	 * //In this example this core will never be called as the event is only fired on the pipe
	 * ape.addEvent('testEvent', function() {
	 * 		console.log('Event received on core');
	 * });
	 * myPipe.addEvent('testEvent', function() {
	 * 	console.log('Event received on pipe');
	 * });
	 * //Fire the event only on the pipe
	 * myPipe.fireEvent('testEvent');
	 *
	 * @see APE.addEvent
	 * @see APE.fireEvent
	 * @see APE.Pipe.fireEvent
	 */
	/**
	 * Fire a event manually on a pipe.
	 * <p>Executes all events of the specified type present on in only this pipe.</p>
	 *
	 * @name APE.Pipe.fireEvent
	 * @function
	 * @public
	 *
	 * @param {string} eventName Event to launch.
	 * @param {Array|object} args The arguments for the appropiate event callbacks
	 * @param {integer} [delay] Delay in ms before the event should be fired
	 * @returns {APE}
	 *
	 * @example
	 * //ape var is a reference to APE instance
	 * //myPipe var is a reference to a pipe object
	 * //In this example this core will never be called as the event is only fired on the pipe
	 * ape.addEvent('testEvent', function() {
	 * 		console.log('Event received on core');
	 * 	});
	 * 	myPipe.addEvent('testEvent', function() {
	 * 		console.log('Event received on pipe');
	 * });
	 * //Fire the event only on the pipe
	 * myPipe.fireEvent('testEvent');
	 *
	 * @see APE.fireEvent
	 * @see APE.addEvent
	 * @see APE.Pipe.addEvent
	 * @see APE.Pipe.fireGlobalEvent
	 */
	Implements: APE.Events,
	initialize: function(ape, options) {
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
			stack: {
				add: function() {
					var args = this.parsePipeCmd.apply(this, arguments);
					this.ape.request.stack.add.apply(this.ape.request.stack, args);
				}.bind(this),
				send: this.ape.request.stack.send.bind(this.ape.request.stack)
			}
		};
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
	/**
	* Shortcut to Send a message to the APE server on this pipe
	*
	* @name APE.Pipe.send
	* @function
	* @public
	*
	* @param {object} [params] The message content
	*
	* @example
	* //ape var is a reference to APE instance
	* //Join channel testChannel
	* ape.join('testChannel');
	* ape.addEvent('pipeCreate', function(type, pipe, options) {
	* 	//Send "Hello world" on the pipe
	* 	pipe.send('Hello world');
	* 	//pipe.send is a shorcut for :
	*  	pipe.request.send({'msg':'Hellow world'});
	* });
	*
	* @see APE.Request.send
	* @see APE.Request.Stack.send
	* @see APE.Request.CycledStack.send
	*/
	send: function(data) {
		this.request.send('SEND', {'msg': data});
	},
	/**
	* Return the pubid of the pipe
	*
	* @name APE.Pipe.getPubid
	* @function
	* @public
	*
	* @returns {string} The pubid of this pipe
	*
	* @example
	* //ape var is a reference to APE instance
	- ape.addEvent('pipeCreate', function(type, pipe, options) {
	* 	var pubid = pipe.getPubid();
	* 	//pipes is hash indexed by pubid containings all pipes
	* 	var thePipe = ape.pipes.get(pubid);
	* 	//thePipe is the same var than the var pipe passed in arguments
	* });
	*/
	getPubid: function() {
		return this.pipe.pubid;
	},
	/**
	 * Executes all events of the specified type present on in this pipe and in the core
	 * <p>When an event is fired on the core, it's also fired on the APE Client (as client and core share the same events).</p>
	 *
	 * @name APE.Pipe.fireGlobalEvent
	 * @function
	 * @public
	 *
	 * @param {string} eventName Event to launch.
	 * @param {Array|object} args The arguments for the appropiate event callbacks
	 * @param {integer} [delay] Delay in ms before the event should be fired
	 * @returns {APE}
	 *
	 * @example
	 * //ape var is a reference to APE instance
	 * //myPipe var is a reference to a pipe object
	 * //client var is a reference to a client instance
	 * //Intercept event on pipe
	 * myPipe.addEvent('testEvent', function() {
	 * 		console.log('event received on pipe');
	 * });
	 * //Intercept event on core
	 * ape.addEvent('testEvent', function() {
	 * 		console.log('event received on core');
	 * });
	 * //Fire the event "testEvent" on the Pipe & Core
	 * myPipe.fireGlobalEvent('testEvent', ['args1', 'args2']);
	 *
	 * @see APE.fireEvent
	 * @see APE.Pipe.addEvent
	 * @see APE.Pipe.fireGlobalEvent
	 */
	fireGlobalEvent: function(type, fn, internal) {
		this.fireEvent(type, fn, internal);
		this.ape.fireEvent(type, fn, internal);
	},
	fireInTheHall: this.fireGlobalEvent
});
