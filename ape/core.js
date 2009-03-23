/*
  Copyright (C) 2008  Nicolas Trani <n.trani@weelya.com> / Antohny Catel <a.catel@weelya.com> / Florian Gasquez <f.gasquez@weelya.com / John Chavarria <j.chavarria@weelya.com>
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
 *                 __------__      /							    \
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

var Ape_core = new Class({

	Implements : [Options, Events],

	options:{
		server:window.location.hostname,	//Ape server URL
		pool_time:25000, 			//Max time for a request
		identifier:'ape',			//Identifier is used by cookie to differenciate ape instance
		transport:1,
		frequency:0				//Ffrequency identifier
	},

	initialize: function(options){
		this.setOptions(options);
		this.complete_options = {};
		this.pipes = new $H; 
		this.sessid = null;
		this.pubid = null;
		this.timer = null;

		this.add_event('raw_login', this.raw_login);
		this.add_event('raw_err', this.raw_err);

		this.add_event('err_003', this.clear_session);
		this.add_event('err_004', this.clear_session);

		this.fire_event('loaded', this);
		
		/*
		 * Browser using webkit and presto let a loading bar (or cursor), even if page loaded 
		 * This case happend, only if XHR is made while parent page is loading
		 */
		if (Browser.Engine.webkit || Browser.Engine.presto) {
			var oldonload = window.parent.onload,
			fn = function(){
				this.stop_window = true;
			}.bind(this);

			//Add function to load event
			if (typeof window.parent.onload != 'function') {
				window.parent.onload = fn;
			} else {
				window.parent.onload = function(){
					oldonload(); 
					fn();
				}
			}
		}
		
		//Fix presto bug (see request method)
		if (Browser.Engine.presto) {
			this.watch_var_changed = false;
			this.watch_var.periodical(10, this);
		}
		//Set _core var for Ape_client instance
		if(options.init) options.init.apply(null, [this]);
		//Execute complete function of Ape_client instance
		if(options.complete) options.complete.apply(null, [this ,this.complete_options]);
	},

	/***
	 * Register an event
	 * @param	String	Type (Event name)
	 * @param	Args	Array or single object, arguments to pass to the function. If more than one argument, must be an array.
	 * @param	Int	Delay (in ms) to wait to execute the event.
	 */
	fire_event: function(type, args, delay){
		this.fireEvent(type, args, delay);
	},

	/****
	 * Add an handler for an event
	 * @param	String		Type (Event name)
	 * @param	Function	Function to execute
	 * @param	??		??
	 */
	add_event: function(type, fn, internal){
		this.addEvent(type, fn, internal);
	},

	/***
	* Execute check request each X seconde
	*/
	pooler: function(){
		//Check if another request might not running and do not need to be closed
		//Note : pool time is decrease of 2s beacuse js periodical is not verry accurate
		if($time() - this.last_action_ut >= this.options.pool_time - 20000){
			this.check();
		}
	},

	/***
	 * Start the pooler
	 */
	start_pooler: function(){
		this.timer = this.pooler.periodical(this.options.pool_time, this);//Creating pooler 
	},

	/***
	 * Stop the pooler (Witch send check raw)
	 */
	stop_pooler: function(){
		$clear(this.timer);
	},

	/***
	 * Make a xmlhttrequest, once result received the parse_response function is called 
	 * @param 	string	Raw to send
	 * @param	boolean	If true sessid is added to request
	 * @param	Mixed	Can be array,object or string, if more than one, must be a string	
	 * @param	Object	Options
	 */
	request: function(raw, param, sessid, options){
		//Opera dirty fix
		if (Browser.Engine.presto && options && !options.no_watch) {
			this.watch_var_changed = true;
			this.watch_var_cnt = [raw, param, sessid, options];
			return;
		}

		//Set options
		if (!options) options = {};
		if (!options.event) options.event = true;
		//This id dirty -_-
		if (!$type(options.async)) options.async = true;
		if (!$type(sessid)) sessid = true;
		param = param || [];

		//Format params
		var query_string = raw,
		    time = $time();
		if ($type(param) == 'object') {
			var tmp = [];
			for (var i in param) {
				tmp.push(param[i]);
			}
			param = tmp;
		} else {
			param = $splat(param);
		}
		//Add sessid
		if (sessid) param.unshift(this.get_sessid());

		//Create query string
		if (param.length > 0) {
			query_string += '&' + param.join('&');
		}

		//XHR Time
		this.current_request = new Request.JSON({	
								'async': options.async,
								'method': 'post',
								'url': 'http://' + this.options.frequency + '.' + this.options.server + '/?q',
								'link': 'cancel',
								'onComplete': this.parse_response.bind(this)
							});
		this.current_request.send(query_string + '&' + time);
		this.last_action_ut = time;

		if (!options.event) {
			this.fire_event('cmd_' + raw.toLowerCase(), param);
		}
	},

	/**
	* Parse received raws
	* @param	Array	An array of raw 
	*/
	parse_response: function(raws){
		//This is fix for Webkit and Presto, see initialize method for more information
		if (this.stop_window) { 
			window.parent.stop();
			this.stop_window=false;
		}

		if (raws && raws != 'CLOSE\n' && raws != 'QUIT\n') {
			var 	l = raws.length,
				raw;
			for (var i=0; i<l; i++) {
				//Last request is finished
				raw = raws[i];
				this.call_raw(raw);
				if (this.current_request.xhr.readyState == 4) {
					if (raw.datas.code!= '001' && raw.datas.code != '004' && raw.datas.code != '003') {
						this.check();
					}
				}
			}
		}
		if (raws == 'QUIT\n') {
			this.quit();
		}
	},

	/***
	 * Fire event raw_'raw', if needed create also new pipe object
	 * @param	Object	raw object
	 */
	call_raw: function(raw){
		var args;
		if (raw.datas.pipe) {
			var pipe_id = raw.datas.pipe.pubid;
			if (!this.pipes.has(pipe_id)) {
				var pipe;
				switch (raw.datas.pipe.casttype) {
					case 'uni':
						pipe = this.new_pipe_single(raw.datas);
					break;
					case 'proxy':
						pipe = this.new_pipe_proxy(raw.datas);
					break;
					case 'multi':
						pipe = this.new_pipe_multi(raw.datas);
					break;
				}
			} else {
				pipe = this.pipes.get(pipe_id);
			}
			args = [pipe, raw];
		} else {
			args = raw;
		}
		this.fire_event('raw_' + raw.raw.toLowerCase(), args);
	},

	/***
	 * Create a new single pipe
	 * @param	Object	Options used to instanciate Ape_pipe_single
	 * @return	Object	Ape_pipe_single object
	 */
	new_pipe_single: function(options){
		return new Ape_pipe_single(this, options);
	},

	/***
	 * Create a new multi pipe
	 * @param	Object	Options used to instanciate Ape_pipe_multi
	 * @return	Object	Ape_pipe_multi object
	 */
	new_pipe_multi: function(options){
		return new Ape_pipe_multi(this, options);
	},
	
	/***
	 * Create a proxy pipe
	 * @param	Object	Options used to instanciate Ape_pipe_proxy
	 */
	new_pipe_proxy: function(options){
		return new Ape_pipe_proxy(this,options);
	},
	/***
	 * This allow ape to be compatible with TCPSocket
	 */
	TCPSocket: Ape_pipe_proxy,

	/***
	 * Add a pipe to the core pipes hash
	 * @param	string	Pipe pubid (this will be the key hash)
	 * @return	object	Pipe object
	 */
	add_pipe: function(pubid, pipe){
		var tmp = this.pipes.get(pubid);
		if(tmp){
			tmp.toto = 'toto';
			console.log('pipe deleted',tmp);
	//		this.removeEvent('raw_proxy',tmp.raw_proxy);
	//		this.removeEvent('raw_proxy_event',tmp.raw_proxy_event);
			console.log(tmp);
			console.log(this.$events);
		}
		console.log('adding pipe',pubid,pipe);
		return this.pipes.set(pubid, pipe); 
	},

	/***
	 * Return a pipe identified by pubid
	 * @param	string	Pipe pubid
	 * @return	Object	pipe
	 */
	get_pipe: function(pubid){
		return this.pipes.get(pubid);
	},

	/***
	 * Remove a pipe from the pipe hash and fire event 'pipe_deleted'
	 * @param	string	Pipe pubid
	 * @return	object	The pipe object
	 */
	del_pipe: function(pubid){
		var pipe = this.pipes.erase(pubid);
		this.fire_event('pipe_deleted', pipe);
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
	*/
	check: function(){
		this.request('CHECK');
	},

	/****
	* Send connect request to server
	* @param	Mixed string or array with options to send to ape server with connect cmd, if more than one, must be an array
	*/
	connect: function(options){
		options = $splat(options);
		options.push(this.options.transport);
		this.request('CONNECT', options, false);
	},

	/***
	* Join a channel
	* @param	string	Channel name
	*/
	join: function(chan){
		this.request('JOIN', [chan]);
	},

	/***
	 * Left a channel
	 * @param	string	Pipe pubid
	 */
	left: function(pubid){
		this.request('LEFT', this.pipies.get(pubid).name);
		this.del_pipe(pubid);
	},

	/***
	* Do necesary stuff to quit ape 
	*/
	quit: function(){
		this.request('QUIT');
		this.clear_session();
	},

	/***
	 * Return current sessid
	 * @return	string	sessid
	 */
	get_sessid:function(){
		return this.sessid;
	},

	/***
	 * Set current sessid
	 * @param	string	sessid
	 */
	set_sessid: function(sessid){
		this.sessid = sessid;
	},

	/***
	 * Store a session variable on ape
	 * @param	string	key
	 * @param	string	value
	 */
	set_session: function(key, value, options){
		if (!options) options = {};
		//session var is tagged as "update" response
		if (!options.tag) options.tag = false;
		var arr = ['set', key, escape(value)]
		if (options.tag){
			arr.push(1);
		}
		this.request('SESSION', arr, true, options);
	},

	/***
	 * Receive a session variable from ape
	 * @param	string	key
	 */
	get_session: function(key){
		this.request('SESSION', ['get', key]);
	},

	/***
	* Handle login raw
	* If autojoin is defined join the specified channel, then start the pooler and finnaly create cookie session
	* @param Object received raw
	*/
	raw_login: function(param){
		this.set_sessid(param.datas.sessid);
		this.user = param.datas.user;
		if (this.options.channel) {
			this.join(this.options.channel);
		}
		this.running = true;
		this.fire_event('initialized');
		this.start_pooler();
	},

	/***
	* Fire event for all error raw
	* @param	object	raw
	*/
	raw_err: function(err){
		this.fire_event('err_' + err.datas.code, err);
	},

	/****
	 * This method is only used by opera.
	 * Opera have a bug, when request are sent trought user action (ex : a click), opera throw a security violation when trying to make a XHR.
	 * The only way is to set a class var and watch when this var change
	 */
	watch_var: function(){
		if (this.watch_var_changed) {
			this.watch_var_changed = false;
			if (!this.watch_var_cnt[2]) this.watch_var_cnt[2] = {};
			this.watch_var_cnt[2].no_watch = true;
			this.request.run(this.watch_var_cnt, this);
		}
	},

	/***
	 * Clear the sessions, clean timer, remove cookies, remove events
	 */
	clear_session:function(){
		this.set_sessid(null);
		this.$events = {} //Clear events
		this.stop_pooler();
		this.current_request.cancel();
		this.running = false;
	}
});

var identifier 	= window.frameElement.id,
    Ape,
    config 	= window.parent.Ape_config[identifier.substring(4, identifier.length)];
window.addEvent('domready', function(){
	Ape = new Ape_core(config);
});
