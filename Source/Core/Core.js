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
APE.Core = new Class({

	Implements: [APE.Events, Options],

	$originalEvents: {},

	options:{
		server: '', // APE server URL
		pollTime: 25000, // Max time for a request
		identifier: 'ape', // Identifier is used by cookie to differentiate ape instance
		transport: 0, // Transport 0: long polling, 1 : XHRStreaming, 2: JSONP, 3 SSE / JSONP, 4 : SSE / XHR
		frequency: 0, // Frequency identifier
		cycledStackTime: 350 //Time before send request of cycledStack
	},

	initialize: function(options){
		window.Ape = this;
		this.setOptions(options);

		this.selectTransport();
		this.request = new APE.Request(this);

		this.pipes = new $H; 
		this.users = new $H;

		this.sessid = null;
		this.pubid = null;

		this.timer = null;
		this.status = 0; // 0 = APE is not initialized, 1 = connected, -1 = Disconnected by timeout, -2 = Disconnected by request failure
		this.failCounter = 0;
		this.pollerObserver = null;

		this.onRaw('login', this.rawLogin);
		this.onRaw('err', this.rawErr);
		this.onRaw('ident', this.rawIdent);

		this.onError('003', this.clearSession);
		this.onError('004', this.clearSession);

		//Set core var for APE.Client instance
		if (options.init) options.init.apply(null, [this]);

		//Execute complete function of APE.Client instance
		if (options.complete) options.complete.apply(null, [this]);
		this.fireEvent('load', this);
	},

	selectTransport: function() {
		var transports = [APE.Transport.longPolling, APE.Transport.XHRStreaming, APE.Transport.JSONP];
		var transport = this.options.transport;
		var support;

		while (support != true) {
			support = transports[transport].browserSupport();//Test if browser support transport	

			if (support) {
				this.options.transport = transport;
				this.transport = new transports[transport](this);
			}
			else transport = support;//Browser do not support transport, next loop will test with fallback transport returned by browserSupport();
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

	parseParam: function(param) {
		return ($type(param) == 'object') ? Hash.getValues(param) : $splat(param);
	},

	cancelRequest: function() {
		this.transport.cancel();
	},

	/***
	 * Function called when a request fail or timeout
	 */
	requestFail: function(args, failStatus, request) {
		var reSendData = false;

		if (request.request && !request.request.dataSent) reSendData = true;

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
			this.request.send.delay(delay, this.request, args);
		} else {
			this.check.delay(delay, this);
		}
		/*(function() {
			if (this.status == 0) this.check();
		}.delay(delay+300, this))*/
	},

	/***
	 * Parse received data from Server
	 */
	parseResponse: function(raws, callback){
		if (raws){
			if (this.status < 0 ) {
				this.failCounter = 0;
				this.status = 1;
				this.startPoller();
				this.fireEvent('apeReconnect');
			}
		}

		//This should no longer happend
		//if (raws == 'CLOSE' && !this.transport.running()) {
		//	if (callback && $type(callback)=='function') callback.run(raws);
		//	this.check();
		//	return;
		//}
		if (raws == 'QUIT'){
			this.quit();
			return; 
		}

		var check = false;
		var chlCallback;//Callback on challenge

		if (raws) {
			raws = JSON.decode(raws, true);//TODO replace me by eval for performance purpose
			if (!raws){ // Something went wrong, json decode failed
				this.check();
				return;
			}

			for (var i = 0; i < raws.length; i++){ //Read all raw
				var raw = raws[i];
				if (callback && $type(callback) == 'function') {
					callback.run(raw);
				}

				if (raw.data.chl) {//Execute callback on challenge
					chlCallback = this.request.callbackChl.get(raw.data.chl);
					if (chlCallback) {
						chlCallback.run(raw);
						this.request.callbackChl.erase(raw.data.chl);
					}
				}
				this.callRaw(raw);

				//Last request is finished and it's not an error
				if (!this.transport.running()) {
					if (!raw.data.code || (raw.data.code!='005' && raw.data.code!= '001' && raw.data.code != '004' && raw.data.code != '003')) {
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
	 * Fire raw event. If received raw is on a non-existing pipe, create new pipe
	 */
	callRaw: function(raw) {
		var args;
		if (raw.data.pipe) {
			var pipeId = raw.data.pipe.pubid, pipe;
			if (!this.pipes.has(pipeId)) {
				pipe = this.newPipe(raw.data.pipe.casttype, raw.data);
			} else {
				pipe = this.pipes.get(pipeId);
				//Update pipe properties
				pipe.properties = raw.data.pipe.properties;
			}
			if (pipe) {
				args = [raw, pipe];
				pipe.fireEvent('raw_' + raw.raw.toLowerCase(), args);
			}
		} else {
			args = raw;
		}
		this.fireEvent('raw_' + raw.raw.toLowerCase(), args);
	},
	
	newPipe: function(type, options){
		if (options && options.pipe.pubid) {
			var pipe = this.pipes.get(options.pipe.pubid)
			if (pipe) return pipe;
		} 

		if(type == 'uni') return new APE.PipeSingle(this, options);
		if(type == 'multi') return new APE.PipeMulti(this, options);
		if(type == 'proxy') return new APE.PipeProxy(this, options);
	},

	/***
	 * Add a pipe to the core pipes hash
	 */
	addPipe: function(pubid, pipe){
		return this.pipes.set(pubid, pipe); 
	},

	getPipe: function(pubid){
		var pipe = this.pipes.get(pubid);
		if (!pipe) {
			pipe = this.users.get(pubid);
			if (pipe) pipe = this.newPipe('uni', {'pipe': pipe});
		}
		return pipe;
	},

	/***
	 * Remove a pipe from the pipe hash and fire event 'pipeDelete'
	 */
	delPipe: function(pubid){
		var pipe = this.pipes.get(pubid);
		this.pipes.erase(pubid);
		this.fireEvent(pipe.type+'PipeDelete', [pipe.type, pipe]);
		return pipe;
	},
	
	check: function(){
		this.request.send('CHECK', null, true);
	},

	start: function(options, sendStack){
		this.connect(options, sendStack); 
	},

	connect: function(options, sendStack){
		this.request.stack.add('CONNECT', $merge(options, {"transport":this.options.transport}), false, false);
		if (this.options.channel) { 
			this.request.stack.add('JOIN', {"channels": this.options.channel}, false);
		}
		if (sendStack !== false) this.request.stack.send();
	},

	join: function(channel){
		this.request.send('JOIN', {"channels":channel});
	},

	left: function(pubid){
		this.request.send('LEFT', {"channel":this.pipes.get(pubid).name});
		this.delPipe(pubid);
	},

	quit: function(){
		this.request.send('QUIT');
		this.clearSession();
	},

	getPubid: function(){
		return this.pubid;
	},

	getSessid:function(){
		return this.sessid;
	},

	setSession: function(obj, options) {
		if (this.restoring) return;
		if (options) this.request.setOptions(options);

		this.request.send('SESSION', {'action': 'set', 'values': obj}, true);
	},

	getSession: function(key){
		this.request.send('SESSION', {'action':'get', 'values': (($type(key) == 'array') ? key : [key])}, true);
	},
	
	rawIdent: function(raw){
		this.user = raw.data.user;
		this.pubid = raw.data.user.pubid;
	},

	rawLogin: function(param){
		this.sessid = param.data.sessid;

		this.status = 1;
		this.startPoller();
		this.fireEvent('ready');
		this.fireEvent('init');
	},

	rawErr: function(err){
		this.fireEvent('error_' + err.data.code, err);
	},
	
	/***
	 * Clear the sessions, clean timer, remove cookies, remove events
	 */
	clearSession:function(){
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

var Ape;  

window.onload = function(){
	var config = window.APEConfig;
	if (!config) {
		var identifier = window.frameElement.id;
		config = window.parent.APE.Config[identifier.substring(4, identifier.length)];
	}
	//Delay of 1ms allow browser to do not show a loading message
	(function() {
		new APE.Core(config);
	}).delay(1);
};
