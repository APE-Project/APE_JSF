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

/***							    ________________________________________________________
 *                 __------__      /													    \
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

var APE_Core = new Class({

	Extends: Events,
	Implements: Options,

	$originalEvents: {},

	options:{
		server: window.location.hostname, // Ape server URL
		poolTime: 25000, // Max time for a request
		identifier: 'ape', // Identifier is used by cookie to differentiate ape instance
		transport: 1, // Transport 1: long pooling, 2: pooling (doesn't work yet), 3: forever iframe, 4: jsonp (didn't work yet), 5: websocket (didn't work yet)
		frequency: 0 // Frequency identifier
	},

	initialize: function(options){
		this.setOptions(options);

		switch (this.options.transport) {
			case 1:
				this.transport = {
					request: Request,
					options: {'method': 'post'}
				};
				break;
			case 4:
				this.transport = {
					request: Request.JSONP,
					options: {}
				};
				break;
		}

		this.pipes = new $H; 
		this.sessid = null;
		this.pubid = null;
		this.xhr = null;
		this.timer = null;
		this.status = 0; //0 = APE is not initialized, 1 = connected, -1 = Disconnected by timeout, -2 = Disconnected by request Failure  
		this.failCounter = 0;
		this.xhrFailObserver = [];
		this.poolerObserver = null;

		this.onRaw('login', this.rawLogin);
		this.onRaw('err', this.rawErr);
		this.onRaw('ident',this.rawIdent);

		this.onError('003', this.clearSession);
		this.onError('004', this.clearSession);

		this.fireEvent('loaded', this);
		
		/*
		 * Browser using webkit and presto let a loading bar (or cursor), even if page loaded 
		 * This case happend, only if XHR is made while parent page is loading
		 */
		if (this.transport == 1 && Browser.Engine.webkit || Browser.Engine.presto) {
			var oldOnload = window.parent.onload,

			fn = function(){
				this.stopWindow = true;
			}.bind(this);

			//Add function to load event
			if (typeof window.parent.onload != 'function') {
				window.parent.onload = fn;
			} else {
				window.parent.onload = function(){
					oldOnload(); 
					fn();
				};
			}
		}

		//Fix presto bug (see request method)
		if (Browser.Engine.presto) {
			this.requestVar = {
				'updated': false,
				'args' : []
			};
			this.requestObserver.periodical(10, this);
		}
		//Set core var for APE_Client instance
		if (options.init) options.init.apply(null, [this]);
		//Execute complete function of APE_Client instance
		if (options.complete) options.complete.apply(null, [this]);
	},

	/***
	 * Register an event
	 * @param	String	Type (Event name)
	 * @param	Args	Array or single object, arguments to pass to the function. If more than one argument, must be an array.
	 * @param	Int	Delay (in ms) to wait to execute the event.
	 */
	fireEvent: function(type, args, delay){
		//Fire the event on each pipe
		this.pipes.each(function(pipe){
			pipe.fireEvent('pipe:' + type, args, delay);
		});
		return this.parent(type, args, delay);
	},

	onError: function(type, fn, internal){
		return this.addEvent('error_' + type, fn, internal);
	},

	onRaw: function(type, fn, internal){
		return this.addEvent('raw_' + type, fn, internal); 
	},
	
	onCmd: function(type, fn, internal){
		return this.addEvent('cmd_' + type, fn, internal);
	},
	
	/***
	* Execute check request each X seconde
	*/
	pooler: function(){
		if (this.poolerActive) {
			this.check();
		}
	},

	/***
	 * Start the pooler
	 */
	startPooler: function(){
		this.poolerActive = true;
	},

	/***
	 * Stop the pooler (Wich send check raw)
	 */
	stopPooler: function(){
		$clear(this.poolerObserver);
		this.poolerActive = false;
	},

	parseParam: function(param){
		var	tmp = [];
		if (typeof (param) == 'object') {
			$each(param, function(e) { tmp.push(e); });
			return tmp;
		} else {
			return $splat(param);
		}
	},

	/***
	 * Make a xmlhttrequest, once result received the parseResponse function is called 
	 * @param 	string	Raw to send
	 * @param	boolean	If true sessid is added to request
	 * @param	Mixed	Can be array,object or string, if more than one, must an array 
	 * @param	Object	Options (event, async, callback )
	 * @param	Boolean	Used only by opera
	 */
	request: function(raw, param, sessid, options, noWatch){
		//Opera dirty fix
		if (Browser.Engine.presto && !noWatch) {
			this.requestVar.updated = true;
			this.requestVar.args.push([raw, param, sessid, options]);
			return;
		}

		//Set options
		if (!$type(sessid)) sessid = true;
		if (!options) options = {};
		if (!options.event) options.event = true;
		if (!options.callback) options.callback = null;
		param = param || [];

		var queryString = raw;
		var time = $time();

		//Format params
		param = this.parseParam(param);
		//Add sessid
		if (sessid) queryString += '&' + this.getSessid();

		//Create query string
		if (param.length > 0) {
			queryString += '&' + param.join('&');
		}

		//Show time
		this.xhr = new this.transport.request($extend(this.transport.options,{	
								'url': 'http://' + this.options.frequency + '.' + this.options.server + '/?',
								'onComplete': this.parseResponse.bindWithEvent(this,options.callback),
								'onFailure': this.xhrFail.bind(this, [arguments,-2])
							}));
		this.xhr.send(queryString + '&' + time);

		//Set up an observer to detect request timeout
		this.xhrFailObserver.push(this.xhrFail.delay(this.options.poolTime + 10000, this, [arguments, -1]));

		$clear(this.poolerObserver);
		this.poolerObserver = this.pooler.delay(this.options.poolTime, this);

		this.lastAction = time;

		if (!options.event) {
			this.fireEvent('cmd_' + raw.toLowerCase(), param);
		}
	},

	/***
	 * Cancel current Request 
	 */
	cancelRequest: function(){
		this.xhr.cancel();
		$clear(this.xhrFailObserver.shift());
	},

	/***
	 * Function called when a request fail or timeout
	 * @param	Array	Arguments passed to request
	 * @param	Integer	Fail status
	 */
	xhrFail: function(args, failStatus) {
		if (this.status > 0) {
			this.status = failStatus;
			this.stopPooler();
			this.cancelRequest();
			this.fireEvent('apeDisconnect');
		} else if(this.failCounter<6 && this.status == -2) {
			this.failCounter++;
		}

		if (this.status == -1) 	this.cancelRequest();
		
		this.request.delay(this.failCounter*1000, this, args);
	},

	/**
	* Parse received raws
	* @param	Array	An array of raw 
	*/
	parseResponse: function(raws, callback){
		if (raws) {
			$clear(this.xhrFailObserver.shift());
			if (this.status < 0 ) {
				this.failCounter = 0;
				this.status = 1;
				this.startPooler();
				this.fireEvent('apeReconnect');
			}
		}
		//This is fix for Webkit and Presto, see initialize method for more information
		if (this.stopWindow) { 
			window.parent.stop();
			this.stopWindow=false;
		}
		if (raws == 'CLOSE' && this.xhr.xhr.readyState == 4){
			if (callback) callback.run(raws);
			this.check();
			return;
		}
		if (raws == 'QUIT') {
			this.quit();
			return;
		}
		var check = false;
		if (raws && raws!='CLOSE') {
			var	raw;
			raws = JSON.decode(raws,true);

			if (!raws){ // Something went wrong, json decode failed
				this.check(); 
				return;
			}

			for (var i = 0; i < raws.length; i++) {
				raw = raws[i];
				if (callback && $type(callback)=='function') callback.run(raw);
				this.callRaw(raw);

				//Last request is finished and it's not an error
				if (this.xhr && this.xhr.xhr.readyState == 4) {
					if (raw.datas.code!= '001' && raw.datas.code != '004' && raw.datas.code != '003') {
						check = true;
					}
				} else {
					//Invalidate check if something went wrong with other raw or a new request have been launched
					check = false;
				}
			}
		}
		if (check) this.check();
	},

	/***
	 * Fire event raw_'raw', if needed create also new pipe object
	 * @param	Object	raw object
	 */
	callRaw: function(raw){
		var args;
		if (raw.datas.pipe) {
			var pipe_id = raw.datas.pipe.pubid,
				pipe;
			if (!this.pipes.has(pipe_id)) {
				pipe = this.newPipe(raw.datas.pipe.casttype, raw.datas);
			} else {
				pipe = this.pipes.get(pipe_id);
			}
			args = [raw, pipe];
		} else {
			args = raw;
		}
		this.fireEvent('raw_' + raw.raw.toLowerCase(), args);
	},
	
	/***
	 * Create a new pipe
	 * @param	String	Pipe type [uni, proxy, single]
	 * @param	Object	Options used to instanciate pipe
	 * @return	Object	pipe
	 */
	newPipe: function(type, options) {
		switch (type) {
			case 'uni':
				return new APE_PipeSingle(this,options);
			break;
			case 'proxy':
				return new APE_PipeProxy(this,options);
			break;
			case 'multi':
				return new APE_PipeMulti(this,options);
			break;
		}
	},

	/***
	 * This allow ape to be compatible with TCPSocket
	 */
	TCPSocket: APE_PipeProxy,

	/***
	 * Add a pipe to the core pipes hash
	 * @param	string	Pipe pubid (this will be the key hash)
	 * @return	object	Pipe object
	 */
	addPipe: function(pubid, pipe){
		return this.pipes.set(pubid, pipe); 
	},

	/***
	 * Return a pipe identified by pubid
	 * @param	string	Pipe pubid
	 * @return	Object	pipe
	 */
	getPipe: function(pubid){
		return this.pipes.get(pubid);
	},

	/***
	 * Remove a pipe from the pipe hash and fire event 'pipeDelete'
	 * @param	string	Pipe pubid
	 * @return	object	The pipe object
	 */
	delPipe: function(pubid){
		var pipe = this.pipes.get(pubid);
		this.pipes.erase(pubid);
		this.fireEvent('pipeDelete', [pipe.type, pipe]);
		return pipe;
	},

	/***
	 * Lauche the connect request
	 * @param	Mixed	Can be array,object or string, if more than one, must be a string	
	 */
	start: function(options){
		this.connect(options); 
	},

	/***
	* Check if there are new message for the user
	* @param	function	Callback (see request)
	*/
	check: function(callback){
		this.request('CHECK', null, true, {'callback': callback});
	},

	/****
	* Send connect request to server
	* @param	Mixed string or array with options to send to ape server with connect cmd, if more than one, must be an array
	*/
	connect: function(options){
		options = this.parseParam(options);
		options.push(this.options.transport);
		this.request('CONNECT', options, false);
	},

	/***
	* Join a channel
	* @param	string	Channel name
	*/
	join: function(chan){
		this.request('JOIN', chan);
	},

	/***
	 * Left a channel
	 * @param	string	Pipe pubid
	 */
	left: function(pubid){
		this.request('LEFT', this.pipes.get(pubid).name);
		this.delPipe(pubid);
	},

	/***
	* Do necesary stuff to quit ape 
	*/
	quit: function(){
		this.request('QUIT');
		this.clearSession();
	},

	setPubid: function(pubid){
		this.pubid = pubid;
	},

	getPubid: function(){
		return this.pubid;
	},

	/***
	 * Return current sessid
	 * @return	string	sessid
	 */
	getSessid:function(){
		return this.sessid;
	},

	/***
	 * Set current sessid
	 * @param	string	sessid
	 */
	setSessid: function(sessid){
		this.sessid = sessid;
	},

	/***
	 * Store a session variable on APE
	 * Note : setSession can't be used while APE is currently restoring
	 * @param	string	key
	 * @param	string	value
	 */
	setSession: function(key, value, options){
		if (!this.restoring) {
			if (!options) options = {};
			var arr = ['set', key, escape(value)];
			this.request('SESSION', arr, true, options);
		}
	},

	/***
	 * Receive a session variable from ape
	 * @param	string	key
	 */
	getSession: function(key,callback){
		this.request('SESSION', ['get', key],true,{'callback':callback});
	},
	
	/***
	 * Save in the core a variable with all information relative to the current user
	 * @param	object	raw
	 */
	rawIdent: function(raw){
		this.user = raw.datas.user;
		this.setPubid(raw.datas.user.pubid);
	},

	/***
	* Handle login raw
	* If autojoin is defined join the specified channel, then start the pooler and finnaly create cookie session
	* @param Object received raw
	*/
	rawLogin: function(param){
		this.setSessid(param.datas.sessid);
		if (this.options.channel) {
			this.join(this.options.channel);
		}
		this.status = 1;
		this.fireEvent('init');
		this.startPooler();
	},

	/***
	* Fire event for all error raw
	* @param	object	raw
	*/
	rawErr: function(err){
		this.fireEvent('error_' + err.datas.code, err);
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
			args[4] = true; //Set noWatch arguments to true
			this.request.run(args, this);
		}
	},

	/***
	 * Clear the sessions, clean timer, remove cookies, remove events
	 */
	clearSession:function(){
		this.setSessid(null);
		this.setPubid(null);
		this.$events = {}; // Clear events
		this.stopPooler();
		this.cancelRequest();
		this.status = 0;
		this.options.restore = false;
	}
});

var identifier 	= window.frameElement.id;
var Ape;
var config 	= window.parent.APE.Config[identifier.substring(4, identifier.length)];

window.onload = function(){
	Ape = new APE_Core(config);
};
