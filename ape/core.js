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
var Ape_core = new Class({
	Implements : [Options, Events],
	options:{
		server:window.location.hostname,	//Ape server URL
		pool_time:25000, 	//Max time for a request
		identifier:'ape',	//Identifier is used by cookie to differenciate ape instance
		frequency:0		//frequency identifier
	},
	initialize: function(options){
		this.setOptions(options);
		this.pipes = new $H; 
		this.sessid = null;
		this.pubid = null;
		this.timer = null;
		this.add_event('raw_login',this.raw_login);
		this.add_event('raw_err',this.raw_err);

		if(options.init) options.init.apply(null,[this]);
		if(options.complete) options.complete.apply(null,[this]);
	},
	/***
	 * Register an event
	 */
	fire_event: function(type,args,delay){
		this.fireEvent(type,args,delay);
	},
	/****
	 * Add an handler for an event
	 */
	add_event: function(type,fn,internal){
		this.addEvent(type,fn,internal);
	},
	/***
	 * Lauche the connect request
	 * @param options object
	 */
	start: function(options){
		this.connect(options); 
	},
	/***
	 * Alert a message
	 * @param	string	message
	 */
	inform: function(msg){
		alert(msg);
	},
	/***
	* Check if there are new message for the user
	*/
	check: function(){
		this.request('CHECK',this.get_sessid());
	},
	/***
	* Execute check request each X seconde
	*/
	pooler: function(){
		//Check if another request might not running and do not need to be closed
		//Note : pool time is decrease of 2s beacuse js periodical is not verry accurate
		if($time()-this.last_action_ut>=this.options.pool_time-20000){
			this.check();
		}
	},
	/***
	 * Start the pooler
	 */
	start_pooler: function(){
		this.timer = this.pooler.periodical(this.options.pool_time,this);//Creating pooler 
	},
	/***
	 * Stop the pooler (who send check raw)
	 */
	stop_pooler: function(){
		$clear(this.timer);
	},
	/***
	 * Make a xmlhttrequest, once result received the parse_response function is called 
	 * @param string raw le raw a exécute
	 * @param Mixed Array||String||Object Lorsque il y a plusieurs élement en paramètre donné un tableau, quand il n'y en a qu'un une String est accepté
	 */
	request: function(raw,param,options){
		if(!options) options = {};
		if(!options.event) options.event = true;
		if(!$type(options.async)) options.async = true;
		var query_string = raw;
		if($type(param)=='object'){
			var tmp = new Array();
			for(var i in param){
				tmp.push(param[i]);
			}
			param = tmp;
		}else{
			param = $splat(param);
		}
		if(param.length > 0){
			query_string +='&'+param.join('&');
		}
		var time = $time();
		this.current_request = new Request.JSON({	
								'async':options.async,
								'method':'post',
								'url':'http://'+this.options.frequency+'.'+this.options.server+'/?q',
								'link':'cancel',
								'onComplete':function(rep){if(rep){this.parse_response(rep)}}.bind(this)
							});
		this.current_request.send(query_string+'&'+time);
		this.last_action_ut = time;
		if(!options.event){
			this.fire_event('raw_'+raw.toLowerCase(),param);
		}
	},
	/**
	* Parse received raws
	*/
	parse_response: function(raws){
		if(raws!='CLOSE\n' && raws!='QUIT\n'){
			var l = raws.length;
			for(var i=0; i<l; i++){
				//Last request is finished
				raw = raws[i];
				this.call_raw(raw);
				if(this.current_request.xhr.readyState==4 && raw.datas.value!='001' && raw.datas.value!='004' && raw.datas.value!='003' && raw.raw!='QUIT'){
					this.check();
				}
			}
		}
		if(raws=='QUIT\n'){
			this.quit();
		}
	},
	/***
	* Call raw sent by server
	*/
	call_raw: function(raw){
		var args;
		if(raw.datas.pipe){
			var pipe_id = raw.datas.pipe.pubid;
			if(!this.pipes.has(pipe_id)){
				var pipe;
				if(raw.datas.pipe.casttype=='uni'){
					pipe = this.new_pipe_single(raw.datas);
				}else{
					pipe = this.new_pipe_multi(raw.datas);
				}
			}else{
				pipe = this.pipes.get(pipe_id);
			}
			args = [pipe,raw];
		}else{
			args = raw;
		}
		this.fire_event('raw_'+raw.raw.toLowerCase(),args);
	},
	/***
	 * Create a new single pipe
	 */
	new_pipe_single: function(options){
		return new Ape_pipe_single(this,options);
	},
	/***
	 * Create a new multi pipe
	 */
	new_pipe_multi: function(options){
		return new Ape_pipe_multi(this,options);
	},
	/***
	 * Private function
	 * add a pipe to the core pipes hash
	 */
	add_pipe: function(pubid,pipe){
		var ret = this.pipes.set(pubid,pipe); 
		return ret;
	},
	/***
	 * Return a pipe identified by pubid
	 */
	get_pipe: function(pubid){
		return this.pipes.get(pubid);
	},
	/***
	 * Remove a pipe from the pipe hash
	 */
	del_pipe: function(pubid){
		var pipe = this.pipes.erase(pubid);
		this.fire_event('pipe_deleted',pipe);
		return pipe;
	},
	/***
	* Do necesary stuff to quit ape 
	*/
	quit: function(){
		this.request('QUIT',this.get_sessid());
		this.clear_session();
	},
	/***
	* Join a channel
	* @param String le channel a rejoindre
	*/
	join: function(chan){
		this.request('JOIN',[this.get_sessid(),chan]);
	},
	/***
	 * Left a channel
	 * @param	string	pipe name
	 */
	left: function(pubid){
		var pipe = this.get_pipe(pubid);
		this.request('LEFT',[this.get_sessid(),pipe.name]);
		this.del_pipe(pubid);
	},
	/****
	* Send connect request to server
	* @param	string	connect options {chan,[uid]}
	* @return boolean true if connect request is send else false
	*/
	connect: function(options){
		this.request('CONNECT',options);
	},
	/***
	* Raw : Getion des érreurs
	*/
	raw_err: function(err){
		switch(err.datas.value){
			case '001' : 
				this.inform('Wrong parameter count');
				break;
			case '002' : 
				this.inform('Bad raw');
				break;
			case '003' : 
				this.clear_session();
				this.inform('Nick aleray in use');
				break;
			case '004' :
				this.clear_session();
				this.inform('Incorrect sessid');
				break;
			case '005' :
				this.inform('Incorrect nick');
				break;
			case 'UNKNOWN_PIPE' : 
				this.inform('Uknow pipe');
				break;
			default :
				this.inform(err.datas.value)
				break;
		}
	},
	/***
	 * Return current sessid
	 */
	get_sessid:function(){
		return this.sessid;
	},
	/***
	 * Set current sessid
	 */
	set_sessid: function(sessid){
		this.sessid = sessid;
	},
	/***
	 * Store a session variable on ape
	 * @param	string	key
	 * @param	string	value
	 */
	set_session: function(key,value,options){
		if(!options) options = {};
		//session var is tagged as "update" response
		if(!options.tag) options.tag = false;
		var arr = [this.get_sessid(),'set',key,escape(value)]
		if(options.tag){
			arr.push(1);
		}
		this.request('SESSION',arr,options);
	},
	/***
	 * Receive a session variable from ape
	 * @param	string	key
	 */
	get_session: function(key){
		this.request('SESSION',[this.get_sessid(),'get',key]);
	},
	/***
	* Handle login raw
	* If autojoin is defined join the specified channel, then start the pooler and finnaly create cookie session
	* @param Object received raw
	*/
	raw_login: function(param){
		this.set_sessid(param.datas.sessid);
		this.user = param.datas.user;
		if(this.options.channel){
			this.join(this.options.channel);
		}
		this.fire_event('initialized');
		this.start_pooler();
	},
	/***
	 * WTF?
	 */
	raw_receive: function(param){
		this.buffers.get(param.buffer).receive(param);
	},
	/***
	 * Clear the sessions, clean timer, remove cookies, remove unload events
	 */
	clear_session:function(){
		this.stop_pooler();
	}
});
if(window.parent.ape_client.ape_config.init_ape){
	var Ape;
	window.addEvent('domready',function(){
		Ape = new Ape_core(window.parent.ape_client.ape_config);
		window.parent.Ape_client._core = Ape;
	});
}
