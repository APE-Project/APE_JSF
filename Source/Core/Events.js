/**
 * Event objects
 * Extends the mootools Request class
 *
 * @name APE.Events
 * @class
 * @private
 */

APE.Events = new Class({
	Extends: Events,
	/*
	* Add a handler for RAW's
	*
	* @param {string} rawName name of the raw
	* @param {function} function to be called
	* @param {object} options
	* @returns {APE}
	*/
	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type.toLowerCase(), fn, internal);
	},
	/*
	* Add a handler for CMD's
	*
	* @param {string} cmdName name of the cmd
	* @param {function} function to be called
	* @param {object} options
	* @returns {APE}
	*/
	onCmd: function(type, fn, internal) {
		return this.addEvent('cmd_' + type.toLowerCase(), fn, internal);
	},
	/*
	* Add a handler for Errors
	*
	* @param {string} errorCode Errorcode nr of the error
	* @param {function} function to be called
	* @param {object} options
	* @returns {APE}
	*/
	onError: function(type, fn, internal) {
		return this.addEvent('error_' + type, fn, internal);
	},
	/*
	* Remove an event
	*
	* @param {string} eventname to be removed
	* @param {function} function to be removed
	* @returns {APE}
	*/
	removeEvent: function(type, fn) {
		return Events.prototype.removeEvent.run([type, this.$originalEvents[type][fn]], this);
	}
});


/**
* Events sent when client apeDisconnect.
* <p>This events is sent when the client is apeDisconnect from the server in the case of connection timeout or request failure.</p>
*
* @name APE.apeDisconnect
* @event
* @public
*
* @see APE.load
* @see APE.restoreStart
* @see APE.restoreEnd
* @see APE.apeDisconnect
* @see APE.apeReconnect
* @see APE.ready
*/

/**
* Event fired when a new Uni Pipe is created.
* <p>This event is fired when a new Uni Pipe is created. A new Uni Pipe is created when you call getPipe with the pubid of an user.</p>
*
* @name APE.uniPipeCreate
* @event
* @public
*
* @param {APE.pipe} pipe The pipe object.
* @param {object} options The options that were passed to the constructor of the pipe.
*
* @example
* //ape var is a reference to APE instance
* ape.join('testChannel');
* ape.addEvent('userJoin', function(user, pipe) {
* 	//For performance purpose, user are not pipe in APE JSF. If you want to have a pipe from an user, use getPipe.
* 	//Transform all user into a pipe object
* 	var pipe = ape.getPipe(user.pubid);
* });
* ape.addEvent('uniPipeCreate', function(pipe, options) {
* //Send 'Hello world' to the user
* 	pipe.send('Hello world');
* });
*
* @see APE.multiPipeCreate
* @see APE.proxyPipeCreate
* @see APE.pipeDelete
*/

/**
* Event fired when a new Multi Pipe is created.
* <p>A new Multi Pipe is created when you successfully joined a channel.</p>
*
* @name APE.multiPipeCreate
* @event
* @public
*
* @param {APE.pipe} pipe The pipe object.
* @param {object} options The options that were passed to the constructor of the pipe.
*
* @example
* //ape var is a reference to APE instance
* ape.join('testChannel');
* //Intercept multiPipeCreate event
* ape.addEvent('multiPipeCreate', function(pipe, options) {
* 	console.log('A new Multi pipe is created. Pipe object : ', pipe);
* });
*
* @see APE.uniPipeCreate
* @see APE.proxyPipeCreate
* @see APE.pipeDelete
* @see APE.PipeMulti.getUser
* @see APE.PipeMulti.left
* @see APE.PipeMulti.users
*/

/**
* Event fired when a new Proxy Pipe is created.
* <p>A new Proxy Pïpe is created in two cases :</p>
* <ul>
* <li>If you use TCP socket interface, the Proxy Pipe is created when the socket is initialized.</li>
* <li>When you explicitly create a new Proxy Pipe with new APE.ProxyPipe();</li></ul></p>
*
* @name APE.proxyPipeCreate
* @event
* @public
*
* @param {APE.pipe} pipe The pipe object.
* @param {object} options The options that were passed to the constructor of the pipe.
*
* @see APE.uniPipeCreate
* @see APE.proxyPipeCreate
* @see APE.proxyClose
* @see APE.proxyConnect
* @see APE.pipeDelete
*/

/**
* Event fired when a user joins a channel
* <p>This event is fired both on core and pipe the user joined</p>
*
* @name APE.userJoin
* @event
* @public
*
* @param {object} user The user that joined
* @param {APE.Pipe} pipe The pipe that is involved
*
* @example
* //ape var is a reference to APE instance
* ape.addEvent('userJoin', function (user, pipe) {
* 	//An user join the channel
* 	console.log('the user ' + user.properties.name + ' join the channel ' + pipe.properties.name);
* });
* @example
* //ape var is a reference to APE instance
* //Join two channel
* ape.join(['channel1', 'channel2']);
* ape.addEvent('pipeCreate', function(type, pipe, options) {
* //Attach userJoin event only to pipe "channel1"
* 	if (type == 'multi' && pipe.properties.name =='channel1') {
* 	pipe.addEvent('userJoin', function(user, pipe) {
* 		console.log('New user on channel1');
* 		});
* 	}
* });
*
* @see APE.userLeft
* @see APE.MultiPipe.left
* @see APE.Pipe.join
*/

/**
* Event fired when a user left a channel
* <p>This event is fired both on core and pipe the user joined</p>
*
* @name APE.userLeft
* @event
* @public
*
* @param {object} user The user that joined
* @param {APE.Pipe} pipe The pipe that is involved
*
* @example
* //ape var is a reference to APE instance
* ape.addEvent('userJoin', function (user, pipe) {
* 	//An user join the channel
* 	console.log('the user ' + user.properties.name + ' join the channel ' + pipe.properties.name);
* });
* @example
* //ape var is a reference to APE instance
* //Join two channel
* ape.join(['channel1', 'channel2']);
* ape.addEvent('pipeCreate', function(type, pipe, options) {
* //Attach userJoin event only to pipe "channel1"
* 	if (type == 'multi' && pipe.properties.name =='channel1') {
* 	pipe.addEvent('userJoin', function(user, pipe) {
* 		console.log('New user on channel1');
* 		});
* 	}
* });
*
* @see APE.userJoin
* @see APE.join
*/

/**
* Event fired when a Multi Pipe is deleted. A pipe is deleted when you leave it.
*
* @name APE.multiPipeDelete
* @event
* @public
*
* @param {APE.Pipe} pipe The pipe object
*
* @example
* //ape var is a reference to APE instance
* //Join testchannel
* ape.join('testchannel');
* //Intercept pipeCreate event (this event is fired when you join a channel)
* ape.addEvent('multiPipeCreate', function(pipe, options) {
* 	if (pipe.properties.name=='teschannel') {
* 		//If pipe is testchannel, left it :p
* 		pipe.left(pipe.getPubid());//This will fire the event multiPipeDelete
* 	}
* });
* ape.addEvent('multiPipeDelete', function(pipe) {
* 	console.log('pipe ' + pipe.properties.name + ' have been deleted')
* });
* @see APE.left
* @see APE.PipeDelete
*/
/**
* Events sent when client apeDisconnect.
* <p>This events is sent when the client is apeDisconnect from the server in the case of connection timeout or request fail</p>
*
* @name APE.apeReconnect
* @event
* @public
*
* @see APE.load
* @see APE.restoreStart
* @see APE.restoreEnd
* @see APE.apeDisconnect
* @see APE.apeReconnect
* @see APE.ready
*/
/**
* Event sent when a pipe is deleted
*
* @name APE.PipeDelete
* @event
* @public
*
* @param {integer} pipeType The type of the pipe (can be uni / multi / proxy)
*
* @example
* //ape var is a reference to APE instance
* //Join testchannel
* ape.join('testchannel');
* //Intercept pipeCreate event (this event is fired when you join a channel)
* ape.addEvent('pipeCreate', function(type, pipe, options) {
* 	if (pipe.properties.name=='teschannel') {
* 		//If pipe is testchannel, left it :p
* 		pipe.left(pipe.getPubid());
* 	}
* });
* //Intercept the pipeDelete event
* ape.addEvent('pipeDelete', function(type, pipe) {
* 	console.log('you just left the pipe ', pipe);
* });
* @see APE.left
* @see APE.multiPipeDelete
*/
/**
* Event sent when the client is connected to the APE server.
* <p>This event is sent when the client is connected to the APE server, just after the login (start(); method);</p>
*
* @name APE.ready
* @event
* @public
*
* @see APE.load
* @see APE.restoreStart
* @see APE.restoreEnd
* @see APE.apeDisconnect
* @see APE.apeReconnect
* @see APE.ready
*/
/**
 * Events sent when the session is cleared.
 * <p>This events is sent when the clearSession(); method is called.</p>
 *
 * @name APE.clearSession
 * @event
 * @public
 * @requires Source/Core/Session.js
 */
/**
* Event sent when the session restore begin.
* <p>This event sent when the session restore has finished.</p>
* <p>The session restore is automatically handled by the JSF if you include Session.js in your APE JSF.</p>
*
* @name APE.restoreEnd
* @event
* @public
* @requires Source/Core/Session.js
*/
/**
* Event sent when the session restore begin.
* <p>This event sent when the session restore begin.</p>
* <p>The session restore is automatically handled by the JSF if you include Session.js in your APE JSF.</p>
*
* @name APE.restoreStart
* @event
* @public
* @requires Source/Core/Session.js
*/

/**
* Intercept an server raw (RAW) on a pipe.
* <p>Execute a function when a raw is received and pass to the function the data received from the server.</p>
* <p>If the received raw is related to a pipe (e.g : you receive data from a channel) the second arguments will be a pipe object.</p>
* <p>If you send custom raw and you want to intercept those on the pipe you need to add a pipe arguments to data your are sending. (see examples for more information).</p>
*
* @name APE.Pipe.onRaw
* @event
* @public
*
* @param {string} rawName The name of the raw (e.g. 'login', 'data');
* @param {function} fn The function to execute upon sending such a command to the server
* @param {object} [fn.args] An object containing all data that was send to the server
* @param {object} [fn.pipe] If the request is made on a pipe (e.g : you sent data to a channel) the second argument will be a pipe object.
* @param {boolean} [internal]Flag to hide the function
* @returns {APE}
*
*
* @example
* //client side code
* /ape var is a reference to APE instance
* //Add an event when a new pipe is created
* ape.addEvent('pipeCreate', function(type, pipe, options) {
* 		//Test if the pipe is a "multi pipe" with name test1
* 		if (type == 'multi' && pipe.name == 'test1') {
* 			//Add an event when a message is received on the pipe test1
* 			pipe.onRaw('data', function(data, pipe) {
* 				console.log('data received on pipe', pipe.name, ' message : ', data.msg);
	* 			});
* 			}
* 		//When a new pipe is created, send hello world
* 		pipe.send('Hello world');
* 	});
* //Join channel test1 and test2
* 	ape.join(['test1', 'test2']);
* @example
* // server side code
* var chan = APE.getChannelByName('demoChannel');
* chan.pipe.sendRaw('testRaw', {'foo': 'bar', 'pipe': chan.pipe.toObject()});
* //Client side code (pipe is a pipe object)
* pipe.onRaw('testRaw', function(data, pipe) {
*		console.log('testRaw received on pipe');
* 	});
*
* @see APE.onRaw
* @see APE.onError
* @see APE.onCmd
* @see APE.Pipe.onCmd
*/

/**
* Intercept an server command (CMD) on a pipe.
* <p>Execute a function when a command is sent and pass to the function the arguments sent to APE server.</p>
*
* @name APE.Pipe.onCmd
* @event
* @public
*
* @param {string} commandName The name of the command (e.g. 'connect', 'send');
* @param {function} fn The function to execute upon sending such a command to the server
* @param {object} [fn.args] An object containing all data that was send to the server
* @param {object} [fn.pipe] If the request is made on a pipe (e.g : you sent data to a channel) the second argument will be a pipe object.
* @param {boolean} [internal] Flag to hide the function
* @returns {APE}
*
* @example
* //ape var is a reference to APE instance
* /Add an event when a new pipe is created
* ape.addEvent('pipeCreate', function(type, pipe, options) {
* 		//Test if the pipe is a "multi pipe" with name test1
* 		if (type == 'multi' && pipe.name == 'test1') {
*  		//Add an event when a message is received on the pipe test1
* 			pipe.onCmd('send', function(data, pipe) {
* 				console.log('Sending data on pipe pipe', pipe.name, ' message : ', data.msg);
* 			});
* 		}
* 		//When a new pipe is created, send hello world
*  	pipe.send('Hello world');
*  	);
* 	//Join channel test1 and test2
* ape.join(['test1', 'test2']);
*
* @see APE.onCmd
* @see APE.onError
* @see APE.onRaw
* @see APE.Pipe.onRaw
*/
/**
* Event sent when the client received data from the proxy.
* <p>This is a global event.</p>
*
* @name APE.proxyRead
* @event
*/

/**
* Event sent when the client is connected to the proxy.
* <p>This is a global event.</p>
*
* @name APE.proxyConnect
* @event
*/
/**
* Event sent when the proxy close the connection.
* <p>This is a global event.</p>
*
* @name APE.proxyClose
* @event
*/
/**
* Intercept an server raw (RAW).
* <p>Execute a function when a raw is received and pass to the function the data received from the server.</p>
* <p>If the received raw is related to a pipe (e.g : you receive data from a channel) the second arguments will be a pipe object.</p>
*
* @name APE.onRaw
* @event
* @public
*
* @param {string} rawName The name of the raw (e.g. 'login', 'data');
* @param {function} fn The function to execute upon sending such a command to the server
* @param {object} [fn.args] An object containing all data that was send to the server
* @param {object} [fn.pipe] If the request is made on a pipe (e.g : you sent data to a channel) the second argument will be a pipe object.
* @param {boolean} [internal]Flag to hide the function
* @returns {APE}
*
* @example
* //ape var is a reference to APE instance
* //Intercept data raw (when you receive data from a channel)
* ape.onRaw('data', function(param, pipe) {
* 	alert('You received : ' + param.data.msg + ' on pipe ' + pipe.properties.name);
* 	//Send some data to the channel
* 	pipe.send('Hey i just received ' + param.data.msg + '!');
* });
*
* @see APE.Pipe.onRaw
* @see APE.onCmd
* @see APE.Pipe.onCmd
* @see APE.onError
*/

/**
* Intercept an server command (CMD).
* <p>Execute a function when a command is sent and pass to the function the arguments sent to APE server.</p>
* <p>If the sent raw is related to a pipe (e.g : you sent data to a channel) the first arguments will be a pipe object.</p>
*
* @name APE.onCmd
* @event
* @public
*
* @param {string} commandName The name of the command (e.g. 'connect', 'send');
* @param {function} fn The function to execute upon sending such a command to the server
* @param {object} [fn.args] An object containing all data that was send to the server
* @param {object} [fn.pipe] If the request is made on a pipe (e.g : you sent data to a channel) the second argument will be a pipe object.
* @param {boolean} [internal] Flag to hide the function
* @returns {APE}
*
* @example
* ///client var is a reference to APE.Client instance
* //start(); method is used to connect to APE.
* client.core.start();
* //Intercept connect command (connect command is used to initiate connection to APE server)
* client.onCmd('connect', function() {
* 	console.log('Connect command sent');
* });
* @example
* //client var is a reference to APE.Client instance
* //Intercept send command (send command is used to send data to a pipe)
* client.onCmd('send', function(pipe, data) {
* 	console.log('You sent ' + data.msg + ' to pipe with pubid' + pipe.getPubid());
* });
* //Intercept pipeCreate event (when a new pipe is created)
* client.addEvent('pipeCreate', function(type, pipe, options) {
* 	//send a message on the pipe ("complex" way)
* 	pipe.request.send('SEND', 'Hello');
* 	//Sending a message could also be done more easily with this code
* 	pipe.send('Hello again!');
* });
*
* @see APE.Pipe.onCmd
* @see APE.onRaw
* @see APE.Pipe.onRaw
* @see APE.onError
*/
/**
* Intercept an error event.
*
* @name APE.onError
* @event
* @public
*
* @param {integer} errorCode The errorCode that was received (e.g. 004);
* @param {function} fn The function to execute upon receiving such an errorcode
* @param {boolean} [internal] Flag to hide the function
* @returns {APE}
*
* @example
* //Instantiate APE Client.
* var client = new APE.Client();
* //Error 004 is when the user send a bad sessid
* client.onError('004', function() {
* 	alert('Bad sessid');
* });
*/
/**
* Load the APE client.
*
* @name APE.load
* @event
* @public
*
* @param {object} options An object with ape default options
* @param {string} [options.server] APE server URL
* @param {string} [options.domain] Your domain, eg : yourdomain.com
* @param {string} [options.identifier] defaults to : ape identifier is used to differentiate two APE instance when you are using more than one application on your website and using Session.js
* @param {Array} [options.scripts] Javascript files to load
* @param {string} [options.channel] Initial channel to connect to upon loading
* @param {object} [options.connectOptions] An object with connect arguments to send to APE server on connect. If given, as soon as APE Core is loaded, it connect to APE server with arguments given in connectOptions.
* @returns {void}
*
* @example
* //Initialize client
* client = new APE.Client();
* client.load();
* client.addEvent('load', function() {
* 	console.log('Your APE client is loaded');
* 	client.core.start({'name': 'apeUser'});
* });
* client.addEvent('start', function() {
* 	console.log('You are connected to APE server. Now you can takeover the world');
* };
* @example
* //Initialize client
* client = new APE.Client();
* //Load APE Core and connect to server
* client.load({
* 	'domain': 'yourdomain.com',
* 	'server': 'ape.yourdomain.com',
* 	'scripts': ['yourdomain.com/APE_JSF/Build/uncompressed/apeCore.js'],
* 	'connectOptions': {'name': 'anotherApeUser'}
* });
* client.addEvent('start', function() {
* 	console.log('You are connected to APE server. Now you can takeover the world');
* };
*
* @see APE.Core
* @see APE.Core.start
*/
