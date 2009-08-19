if (!window.console) {
	window.console = {
		log:function(){
			var div = window.parent.document.createElement('div');
			window.parent.document.body.appendChild(div);
			var txt = '';
			for (var i = 0; i < arguments.length; i++) {
				txt = txt + arguments[i];
			}
			div.innerHTML = txt;
			window.parent.document.body.appendChild(window.parent.document.createElement('hr'));
		}, 
		info:function(){
			console.log.run(arguments);
		}
	};
}
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

/***				    ________________________________________________________
 *                 __------__      /				   	  		    \
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
var APE = {
	Request: {}
};
APE.Core = new Class({

	Extends: Events,
	Implements: Options,

	$originalEvents: {},

	options:{
		server: '', // APE server URL
		pollTime: 25000, // Max time for a request
		identifier: 'ape', // Identifier is used by cookie to differentiate ape instance
		transport: 0, // Transport 0: long polling, 1 : XHRStreaming, 2: JSONP, 3 SSE / JSONP, 4 : SSE / XHR
		frequency: 0 // Frequency identifier
	},

	initialize: function(options){
		window.Ape = this;
		this.setOptions(options);

		this.selectTransport();

		this.pipes = new $H; 
		this.sessid = null;
		this.pubid = null;
		this.timer = null;
		this.status = 0; // 0 = APE is not initialized, 1 = connected, -1 = Disconnected by timeout, -2 = Disconnected by request failure
		this.failCounter = 0;
		this.pollerObserver = null;

		this.onRaw('login', this.rawLogin);
		this.onRaw('err', this.rawErr);
		this.onRaw('ident',this.rawIdent);

		this.onError('003', this.clearSession);
		this.onError('004', this.clearSession);

		//Fix presto bug (see request method)
		if (Browser.Engine.presto){
			this.requestVar = {
				updated: false,
				args: []
			};
			this.requestObserver.periodical(10, this);
		}

		//Set core var for APE.Client instance
		if (options.init) options.init.apply(null, [this]);

		//Execute complete function of APE.Client instance
		if (options.complete) options.complete.apply(null, [this]);

		this.fireEvent('load', this);
	},

	selectTransport: function() {
		var transports = [APE.Request.longPolling, APE.Request.XHRStreaming, APE.Request.JSONP];
		var transport = this.options.transport;
		var support;

		while (support != true) {
			support = transports[transport].browserSupport();//Test if browser support transport	
			console.log(support);

			if (support) this.transport = new transports[transport](this);
			else transport = support;//Browser do not support transport, next loop will test with fallback transport returned by browserSupport();
		}
	},

	onError: function(type, fn, internal) {
		return this.addEvent('error_' + type, fn, internal);
	},

	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type.toLowerCase(), fn, internal); 
	},
	
	onCmd: function(type, fn, internal) {
		return this.addEvent('cmd_' + type.toLowerCase(), fn, internal);
	},	

	poller: function() {
		if (this.pollerActive) this.check();
	},

	/***
	 * Start the poller
	 */
	startPoller: function(){
		console.log('start poller');
		this.pollerActive = true;
	},

	/***
	 * Stop the poller (Wich send check raw)
	 */
	stopPoller: function(){
		console.log('stop poller');
		$clear(this.pollerObserver);
		this.pollerActive = false;
	},

	parseParam: function(param){
		return ($type(param) == 'object') ? Hash.getValues(param) : $splat(param);
	},

	/***
	 * Make a xmlhttrequest, once result received the parseResponse function is called 
	 * @param 	String	Raw to send
	 * @param	Boolean	If true sessid is added to request
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
		param = param || [];
		options = $extend({
			event: true,
			callback: null
		}, options);

		var queryString = raw;

		param = this.parseParam(param);

		if (sessid) queryString += '&' + this.getSessid();

		//Create query string
		if (param.length > 0) queryString += '&' + param.join('&');

		//Show time ;-)
		var request = this.transport.send(queryString, options, arguments);


		$clear(this.pollerObserver);
		this.pollerObserver = this.poller.delay(this.options.pollTime, this);

		if (options.event) this.fireEvent('cmd_' + raw.toLowerCase(), param);
	},

	cancelRequest: function(){
		this.transport.cancel();
	},

	/***
	 * Function called when a request fail or timeout
	 * @param	Array	Arguments passed to request
	 * @param	Integer	Fail status
	 */
	requestFail: function(args, failStatus, request) {
		console.log('Request fail');
		var reSendData = false;

		if (!request.request || !request.request.dataSent) reSendData = false;

		if (this.status > 0) {//APE is connected but request failed
			this.status = failStatus;
			this.cancelRequest();
			this.stopPoller();
			this.fireEvent('apeDisconnect');
		} else if (this.failCounter < 6 && this.status == -2) {//APE is disconnected, and it's by timeout
			this.failCounter++;
		}
		//Cancel last request
		this.cancelRequest();

		var delay = (this.failCounter*1000);
		if (reSendData) {
			console.log('re sending data');
			this.request.delay(delay, this, args);
		} else {
			this.check.delay(delay, this);
		}
		(function() {
			if (this.status < 0) this.check();
		}.delay(delay+300, this))
	},

	/**
	* Parse received raws
	* @param	Array	An array of raw 
	*/
	parseResponse: function(raws, callback){
	  	console.info('receiving', raws);
		if (raws){
			if (this.status < 0 ) {
				this.failCounter = 0;
				this.status = 1;
				this.startPoller();
				this.fireEvent('apeReconnect');
			}
		}

		//This is fix for Webkit and Presto, see initialize method for more information
		/*
		if (this.stopWindow) { 
			console.log('STOP!');
			this.stopWindow = false;
		}
		*/

		if (raws == 'CLOSE' && !this.transport.running()){
			if (callback && $type(callback)=='function') callback.run(raws);
			this.check();
			return;
		}
		if (raws == 'QUIT'){
			this.quit();
			return; 
		}

		var check = false;
		if (raws && raws!='CLOSE') {
			raws = JSON.decode(raws, true);
			if (!raws){ // Something went wrong, json decode failed
				this.check();
				return;
			}

			for (var i = 0; i < raws.length; i++){
				var raw = raws[i];
				if (callback && $type(callback)=='function') callback.run(raw);
				this.callRaw(raw);

				//Last request is finished and it's not an error
				if (!this.transport.running()) {
					if (!raw.datas.code || (raw.datas.code!='005' && raw.datas.code!= '001' && raw.datas.code != '004' && raw.datas.code != '003')) {
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
			var pipeId = raw.datas.pipe.pubid,
				pipe;

			if (!this.pipes.has(pipeId)) {
				pipe = this.newPipe(raw.datas.pipe.casttype, raw.datas);
			} else {
				pipe = this.pipes.get(pipeId);
			}
			args = [raw, pipe];
			pipe.fireEvent('pipe:raw_' + raw.raw.toLowerCase(), args);
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
	newPipe: function(type, options){
		if(type == 'uni') return new APE.PipeSingle(this, options);
		if(type == 'proxy') return new APE.PipeProxy(this, options);
		if(type == 'multi') return new APE.PipeMulti(this, options);
	},

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
	* Check if there are new message for the user
	* @param	function	Callback (see request)
	*/
	check: function(callback){
		this.request('CHECK', null, true, {callback: callback});
	},

	/***
	 * Lauche the connect request
	 * @param	Mixed	Can be array,object or string, if more than one, must be a string	
	 */
	start: function(options){
		this.connect(options); 
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
	join: function(channel){
		this.request('JOIN', channel, true);
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
		if (this.restoring) return;
		
		var arr = ['set', key, escape(value)];
		this.request('SESSION', arr, true, options || {});
	},

	/***
	 * Receive a session variable from ape
	 * @param	string	key
	 */
	getSession: function(key,callback){
		this.request('SESSION', ['get', key], true, {callback: callback});
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
	* If autojoin is defined join the specified channel, then start the poller and finnaly create cookie session
	* @param Object received raw
	*/
	rawLogin: function(param){
		this.setSessid(param.datas.sessid);

		if (this.options.channel) this.join(this.options.channel);
		
		this.status = 1;
		this.startPoller();
		this.fireEvent('init');
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
			args[4] = true; //Set noWatch argument to true
			this.request.run(args, this);
		}
	},

	/***
	 * Clear the sessions, clean timer, remove cookies, remove events
	 */
	clearSession:function(){
		this.setSessid(null);
		this.setPubid(null);
		this.$events = {}; //Clear events
		this.fireEvent('clearSession');
		this.stopPoller();
		this.cancelRequest();
		this.status = 0;
		this.options.restore = false;
	}
});

var Ape;  

window.onload = function(){
	var identifier = window.frameElement.id,
	config = window.parent.APE.Config[identifier.substring(4, identifier.length)];

	new APE.Core(config);
};
