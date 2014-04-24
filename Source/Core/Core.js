/*
  Copyright (C) 2008-2009 Weelya <contact@weelya.com>
  This file is part of APE Client.
  APE is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  APE is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with APE ; if not, write to the Free Software Foundation,
  Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

*/

/**							    ________________________________________________________
 *                 __------__      /										   	  		    \
 *               /~          ~\   | APE, the Ajax Push Engine made with heart (and MooTools) |
 *              |    //^\\//^\|   |    http://www.weelya.net - http://www.ape-project.org    |
 *            /~~\  ||  o| |o|:~\  \ _______________________________________________________/
 *           | |6   ||___|_|_||:|  /
 *            \__.  /      o  \/' /
 *             |   (       O   )_/
 *    /~~~~\    `\  \         /
 *   | |~~\ |     )  ~------~`\
 *  /' |  | |   /     ____ /~~~)\
 * (_/'   | | |     /'    |    ( |
 *        | | |     \    /   __)/ \
 *        \  \ \      \/    /' \   `\
 *          \  \|\        /   | |\___|
 *            \ |  \____/     | |
 *            /^~>  \        _/ <
 *           |  |         \       \
 *           |  | \        \        \
 *           -^-\  \       |        )
 *                `\_______/^\______/
 */

/**
 * Core object, can be extended with sessions
 * <p>To connect such an instance to a APE server user the start() method.</p>
 *
 * @name APE.Core
 * @public
 * @class
 * @constructor
 *
 * @param {object} options Options
 * @param {string} options.server APE server URL (default: '')
 * @param {integer} options.pollTime Max time for a request (default: 25000)
 * @param {string} options.identifier Identifier is used by cookie to differentiate ape instance (default: 'ape')
 * @param {integer} options.transport: Transport [0: long polling, 1 : XHRStreaming, 2: JSONP, 3 SSE / JSONP, 4 : SSE / XHR 6: websocket] (default: 0)
 * @param {integer} options.frequency Frequency identifier (default: 0)
 * @param {integer} options.cycledStackTime Time before send request of cycledStack (default: 350)
 * @param {boolean} options.secure Use https instead of http (default:false)
 *
 * @property {object} user User object
 *
 * @see APE.start
 * @see APE.ready
 * @see APE.load
 */

/**
* APE.Transport namespace
*
* @name APE.Transport
* @namespace
* @augments-APE.Events
*/
APE.Core = new Class({
	Implements: [APE.Events, Options],
	$originalEvents: {},
	options: {
		server: '', // APE server URL
		pollTime: 25000, // Max time for a request
		identifier: 'ape', // Identifier is used by cookie to differentiate ape instance
		transport: 0, // Transport 0: long polling, 1 : XHRStreaming, 2: JSONP, 3 SSE / JSONP, 4 : SSE / XHR 6: websocket
		frequency: 0, // Frequency identifier
		cycledStackTime: 350, //Time before send request of cycledStack
		secure: false
	},
	initialize: function(options) {
		window.Ape = this;
		this.setOptions(options);
		this.selectTransport();
		this.request = new APE.Request(this);
		this.pipes = new $H;
		this.users = new $H;
		this.sessid = null;
		this.pubid = null;
		this.serverUri = (this.options.secure ? 'https' : 'http') + '://' + this.options.frequency + '.' + this.options.server + '/' + this.options.transport + '/?',
		this.timer = null;
		this.status = 0; // 0 = APE is not initialized, 1 = connected, -1 = Disconnected by timeout, -2 = Disconnected by request failure
		this.failCounter = 0;
		this.pollerObserver = null;
		this.requestDisabled = false;
		this.onRaw('login', this.rawLogin);
		this.onRaw('err', this.rawErr);
		this.onRaw('ident', this.rawIdent);
		this.onRaw('quit', this.rawQuit);
		this.onError('003', this.clearSession);
		this.onError('004', this.clearSession);
		//Set core var for APE.Client instance
		if (options.init) options.init.apply(null, [this]);
		//Execute complete function of APE.Client instance
		if (options.complete) options.complete.apply(null, [this]);
		this.fireEvent('load', this);
		if (this.options.connectOptions) this.start(this.options.connectOptions);
	},
	selectTransport: function() {
		var transports = [APE.Transport.longPolling, APE.Transport.XHRStreaming, APE.Transport.JSONP, null, null, null, APE.Transport.WebSocket];
		var transport = this.options.transport;
		var support;
		while (support !== true) {
			support = transports[transport].browserSupport();//Test if browser support transport
			if (support === true) {
				this.options.transport = transport;
				this.transport = new transports[transport](this);
			} else transport = support;//Browser does not support transport, next loop will test with fallback transport returned by browserSupport();
		}
	},
	poller: function() {
		if (this.pollerActive) this.check();
	},
	startPoller: function() {
		this.pollerActive = true;
	},
	stopPoller: function() {
		$clear(this.pollerObserver);
		this.pollerActive = false;
	},
	stopRequest: function() {
		this.cancelRequest();
		if (this.transport.streamRequest) this.transport.streamRequest.cancel();
		this.requestDisabled = true;
	},
	parseParam: function(param) {
		return ($type(param) == 'object') ? Hash.getValues(param) : $splat(param);
	},
	cancelRequest: function() {
		this.transport.cancel();
	},
	/**
	 * Function called when a request fail or timeout.
	 *
	 * @fires APE.apeDisconnect
	 */
	requestFail: function(failStatus, request) {
		var reSendData = false;
		if (request.request && !request.request.dataSent) reSendData = true;
		if (this.status > 0) {//APE is connected but request failed
			this.status = failStatus;
			this.cancelRequest();
			this.stopPoller();
			this.fireEvent('apeDisconnect');
		}
		if (this.failCounter < 6) this.failCounter++;
		//Cancel last request
		this.cancelRequest();
		var delay = (this.failCounter * $random(300, 1000));
		//if (reSendData) {
		//	this.request.send.delay(delay, this.request, queryString);
		//} else {
			this.check.delay(delay, this);
		//}
	},
	/**
	 * Parse received data from Server.
	 *
	 * @fires  APE.apeReconnect
	 */
	parseResponse: function(raws, callback) {
		if (raws) {
			if (this.status < 0) {
				this.failCounter = 0;
				this.status = 1;
				this.startPoller();
				this.fireEvent('apeReconnect');
			}
		}
		var check = false;
		var chlCallback;//Callback on challenge
		if (raws) {
			raws = JSON.parse(raws);
			if (!raws) { // Something went wrong, json decode failed
				this.check();
				return;
			}
			for (var i = 0; i < raws.length; i++) { //Read all raw
				var raw = raws[i];
				if (callback && $type(callback) == 'function') {
					callback.run(raw);
				}
				this.callRaw(raw);
				//Last request is finished and it's not an error
				if (!this.transport.running()) {
					if (!raw.data.code || (raw.data.code != '006' && raw.data.code != '007' && raw.data.code != '005' && raw.data.code != '001' && raw.data.code != '004' && raw.data.code != '003')) {
						check = true;
					}
				} else {
					//Invalidate check if something went wrong with other raw or a new request have been launched
					check = false;
				}
			}
		} else if (!this.transport.running()) check = true; //No request running, request didn't respond correct JSON, something went wrong
		if (check) this.check();
	},
	/**
	 * Fire raw event.
	 * <p>If received raw is on a non-existing pipe, create new pipe.</p>
	 *
	 * @fires APE.onRaw
	 * @fires APE.raw_
	 */
	callRaw: function(raw) {
		var args;
		if (raw.data.pipe) {
			var pipeId = raw.data.pipe.pubid, pipe;
			if (!this.pipes.has(pipeId)) {
				pipe = this.newPipe(raw.data.pipe.casttype, raw.data);
			} else {
				pipe = this.pipes.get(pipeId);
			}
			if (pipe) {
				args = [raw, pipe];
				pipe.fireEvent('raw_' + raw.raw.toLowerCase(), args);
			}
		} else {
			args = raw;
		}
		this.fireEvent('onRaw', args);
		if (raw.data.chl) {//Execute callback on challenge
			var chlCallback = this.request.callbackChl.get(raw.data.chl);
			if (chlCallback) {
				this.request.callbackChl.erase(raw.data.chl);
				chlCallback.run(raw);
			}
		}
		this.fireEvent('raw_' + raw.raw.toLowerCase(), args);
	},
	/**
	* Create a new pipe, or find an existing one by its pubid.
	* <p>If options is a pipe with a existing pubid, that pipe will be returned, else a new one will be created for the desired type.</p>
	*
	* @name APE.Core.newPipe
	* @function
	* @public
	*
	* @param {string} type Can be 'uni', 'multi', 'proxy'
	* @param {object} [options] Option with a pipe.pubid property
	* @returns {APE.PipeSingle|APE.PipeMulti|APE.PipeProxy}
	*/
	newPipe: function(type, options) {
		if (options && options.pipe.pubid) {
			var pipe = this.pipes.get(options.pipe.pubid);
			if (pipe) return pipe;
		}
		if (type == 'uni') return new APE.PipeSingle(this, options);
		if (type == 'multi') return new APE.PipeMulti(this, options);
		if (type == 'proxy') return new APE.PipeProxy(this, options);
	},
	getRequest: function(opt) {
		if (!opt.request) return this.request.send.bind(this.request);
		else return this.request[opt.request].add.bind(this.request[opt.request]);
	},
	/**
	 * Add a pipe to the core pipes hash
	 */
	addPipe: function(pubid, pipe) {
		return this.pipes.set(pubid, pipe);
	},
	/**
	* Get a pipe object
	*
	* @name APE.getPipe
	* @function
	* @public
	*
	* @param {string} pubid The pubid of the pipe
	* @returns {object} A. pipe object or null
	*
	* @example
	* //ape var is a reference to APE instance
	* //Get a pipe
	* var myPipe = ape.getPipe('a852c20b3e5c9889c16fe4ac88abe98f');
	* //Send a message on the pipe
	* myPipe.send('Hello world');
	* @example
	* //ape var is a reference to APE instance
	* //getPipe on Multi Pipe
	* //ape var is a reference to APE instance
	* ape.join('testChannel');
	* //This sample is just here to show you how to intercept pipe pubid in pipeCreate event
	* ape.addEvent('multiPipeCreate', function(type, pipe, options) {
	* 	//Get the pipe object
	* 	var myPubid = ape.getPipe(pipe.getPubid());
	* 	//Send a message on the pipe
	* 	 myPipe.send('Hello world');
	* });
	* @example
	* //ape var is a reference to APE instance
	* //ape var is a reference to APE instance
	* ape.join('testChannel');
	* ape.addEvent('userJoin', function(user, pipe) {
	* 	//For performance purpose, user are not pipe in APE JSF. If you want to have a pipe from an user, use getPipe.
	* 	//Transform all user into a pipe object
	* 	var pipe = ape.getPipe(user.pubid);
	* 	//Send 'Hello world' to the user
	* 	pipe.send('Hello world');
	* });
	*
	* @see APE.Pipe
	*/
	getPipe: function(pubid) {
		var pipe = this.pipes.get(pubid);
		if (!pipe) {
			pipe = this.users.get(pubid);
			if (pipe) pipe = this.newPipe('uni', {'pipe': pipe});
		}
		return pipe;
	},
	/**
	 * Delete a pipe from the Core.
	 * <p>Effectively this removes a pipe from the pipe hash and fire event 'pipeDelete'.</p>
	 * <p>Use this function when you no longer need to use a pipe to free the memory.</p>
	 * <p>You should only use this function to delete Uni Pipe (user pipe). The deleting of Multi Pipe (channel pipe) are automatically handled by the Core when you left a Multi Pipe.</p>
	 *
	 * @name APE.Core.delPipe
	 * @function
	 * @public
	 *
	 * param {string} pubid The pubid of the pipe.*
	 * returns {APE.Pipe} The deleted pipe
	 *
	 * @examples
	 * //ape var is a reference to APE instance
	 * //Join testChannel
	 * ape.join('testChannel');
	 * ape.addEvent('userJoin', function(user, pipe) {
	 * 	//Get the pipe from user
	 * 	var userPipe = ape.getUserPipe(user);
	 * 	//Send a message to the user
	 * 	userPipe.send('Hello world');
	 * 	//Delete the pipe as we no longer need it
	 * 	ape.delPipe(userPipe.getPubid());
	 * });
	 *
	 * @fires APE.PipeDelete
	 */
	delPipe: function(pubid) {
		var pipe = this.pipes.get(pubid);
		this.pipes.erase(pubid);
		this.fireEvent(pipe.type + 'PipeDelete', [pipe]);
		return pipe;
	},
	/**
	* Send a CHECK cmd to the server.
	* <p>Note: this is automatically done and can be configured by the pollTime option parameter.
	*
	* @name APE.check
	* @function
	* @public
	*
	* @example
	* var ape = new APE.Core({
	* 'pollTime': 35000, //if you set pollTime to 35sec you need to set it on the server side to 55sec
	* 'identifier': 'myApplicationIdentifier',
	* });
	* ape.start();
	* // obsessive check
	* setInterval(function(){
	* 	ape.check();
	* }, 1000);
	*
	* @see APE
	*/
	check: function() {
		this.request.send('CHECK');
	},
	/**
	* Initiate a connection to a APE server.
	* <p>If there is an instance of APE present (created via APE.Core()), it can be connected to the server with the start method. The prefered way is to make the connection with APE.load() method.</p>
	*
	* @name APE.start
	* @function
	* @public
	*
	* @param {object} args Connection arguments
	* @param {object} options Connection options (e.g.  'channel')
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	*  ape.start(); //Send CONNECT command to APE.
	* @example
	* //ape var is a reference to APE instance
	* //If you use APE with libape-chat you need to send your nickname in the CONNECT request
	* ape.start('myNickname'); //Send CONNECT command with a nickname to APE and tries to join the optional channel
	*
	* @see APE.load
	* @see APE.restoreStart
	* @see APE.restoreEnd
	* @see APE.apeDisconnect
	* @see APE.apeReconnect
	* @see APE.ready
	*/
	start: function(args, options) {
		this.connect(args, options);
	},
	connect: function(args, options) {
		if (!options) options = {};
		options.sessid = false;
		this.request.stack.add('CONNECT', args, options);
		if (this.options.channel) {
			this.request.stack.add('JOIN', {'channels': this.options.channel}, options);
		}
		if (!$defined(options.sendStack) && options.sendStack !== false) this.request.stack.send();
	},
	/**
	* Join one or many channels.
	*
	* @name APE.join
	* @function
	* @public
	*
	* @param {string|Array} channel The channel(s) to join
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	* ape.join('testchannel'); //Join channel "testchannel"
	* //ape var is a reference to APE instance
	* ape.join(['channel1', 'channel2']); //Join channels "channel1" and "channel2"
	*
	* @see APE.left
	*/
	join: function(channel, options) {
		options = options || {};
		options.channels = channel;
		this.request.send('JOIN', options);
	},
	/**
	* Leave (unsubscribe) a channel and fire the pipeDelete
	*
	* @name APE.left
	* @function
	* @public
	*
	* @param {string} pubid The pubid of the channel
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	* //Join testchannel
	* ape.join('testchannel');
	* //Intercept pipeCreate event (this event is fired when you join a channel)
	* ape.addEvent('multiPipeCreate', function(pipe, options) {
	* if (pipe.properties.name=='teschannel') {
	* 	//If pipe is testchannel, left it :p
	* 	ape.left(pipe.getPubid());
	* 	}
	* });
	*
	* @see APE.join
	*/
	left: function(pubid) {
		this.request.send('LEFT', {'channel': this.pipes.get(pubid).name});
	},
	/**
	* Exit APE
	* <p>Sends a QUIT CMD and clears the sessions</p>
	*
	* @name APE.quit
	* @function
	* @public
	*
	* @returns {void}
	* @example
	* //ape var is a reference to APE instance
	* ape.quit();
	*
	* @see APE.clearSession
	*/
	quit: function() {
		this.request.send('QUIT');
		this.clearSession();
	},
	getPubid: function() {
		return this.pubid;
	},
	getSessid: function() {
		return this.sessid;
	},
	/**
	* Save a sesion variable on the APE server.
	* <p>Adds a key-value pair to the session on the APE server or replaces a previous value associated with the specified key.</p>
	*
	* @name APE.setSession
	* @function
	* @public
	*
	* @param {string} key The key
	* @param {string} value The value that will be associated with that key
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	* ape.setSession({'myKey1':'myValue','myKey2':'myValue2'});
	* ape.getSession('myKey', function() {
	* 	console.log(resp.datas.sessions.myKey1);
	* });
	* @example
	* //ape var is a reference to APE instance
	* ape.setSession({'myKey':'["A Json array", "Value 2"]'});
	* ape.getSession('myKey', function(response) {
	* //decode the received data, and use eval to dedode the data
	* console.log(eval(decodeURIComponent(response.datas.sessions.myKey)));
	* });
	*
	* @see APE.getSession
	* @see APE.clearSession
	*/
	setSession: function(obj, option) {
		if (this.restoring) return;
		this.request.send('SESSION', {'action': 'set', 'values': obj}, option);
	},
	/**
	* Retrieves a value from the session on the APE server.
	*
	* @name APE.getSession
	* @function
	* @public
	*
	* @param {string|Array} key The key(s) to retrieve
	* @param {function} fn Callback function to execute when the sessions is received. One arguments is passed to the callback function with the response of the server.
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	* 	ape.setSession({'myKey1':'myValue','myKey2':'myValue2'});
	* 	ape.getSession('myKey', function(resp) {
	* 		console.log(resp.datas.sessions.myKey);
	* });
	* @example
	* //ape var is a reference to APE instance
	* ape.setSession({'myKey':'["A Json array", "Value 2"]'});
	* ape.getSession('myKey', function(resp) {
	* 	//decode the received data, and use eval to dedode the data
	* 	console.log(eval(decodeURIComponent(resp.datas.sessions.myKey)));
	* });
	*
	* @see APE.setSession
	* @see APE.clearSession
	*/
	getSession: function(key, callback, option) {
		if (!option) option = {};
		var requestOption = {};
		if (callback) {
			requestOption.callback = function(resp) {
				if (resp.raw == 'SESSIONS') this.apply(null, arguments);
			}.bind(callback);
		}
		requestOption.requestCallback = option.requestCallback || null;
		this.getRequest(option)('SESSION', {
				'action': 'get',
				'values': (($type(key) == 'array') ? key : [key])
			}, requestOption);
		if (option.request && option.sendStack !== false) {
			this.request[option.request].send();
		}
	},
	rawIdent: function(raw) {
		this.user = raw.data.user;
		this.pubid = raw.data.user.pubid;
		this.user.pipes = new $H;
		this.users.set(this.pubid, this.user);
	},
	/**
	* @fires APE.ready
	* @fires APE.init
	*/
	rawLogin: function(param) {
		this.sessid = param.data.sessid;
		this.status = 1;
		this.startPoller();
		this.fireEvent('ready');
		this.fireEvent('init');
	},
	/**
	* @fires APE.error_
	*/
	rawErr: function(err) {
		this.fireEvent('error_' + err.data.code, err);
	},
	/**
	*
	* @see APE.quit
	*/
	rawQuit: function() {
		this.stopRequest();
	},
	/**
	* Clear the sessions, clean timer, remove cookies, remove events, stop all running requests, reset sissd and pubid
	*
	* @name APE.clearSession
	* @function
	* @public
	*
	* @example
	* //ape var is a reference to APE instance
	* //Error 004 is fired when you sent a bad sessid (this can happen if the client experience some connection issue longer than 45sec)
	* ape.onError('004', function() {
	* 	ape.clearSession();
	* 	ape.initialize(ape.options); //Reinitialize APE class
	* });
	*
	* @see APE.quit
	* @see APE.getSession
	* @see APE.setSession
	* @fires APE.clearSession
	 */
	clearSession: function() {
		//Clear all APE var
		this.sessid = null;
		this.pubid = null;
		this.$events = {};
		this.request.chl = 1;
		this.status = 0;
		this.options.restore = false;
		this.fireEvent('clearSession');
		this.stopPoller();
		this.cancelRequest();
	}
});
/**
 * Ape variable
 *
 * @name Ape
 *
 */
var Ape;
/**
 * Ape initialiser
 *
 * @name APE.init
 * @function
 * @public
 *
 * @param {object} config Configuration object
 *
 * @see APE.Core
 * @see APE.Client
 * @see APE.load
 * @see APE.start
 *
 */
APE.init = function(config) {
	//Delay of 1ms allow browser to do not show a loading message
	(function() {
		new APE.Core(config);
	}).delay(1);
};
