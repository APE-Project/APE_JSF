var Ape_core = new Class({
	Extends: Ape_core,
	initialize: function(options){
		this.sessions = {};
		if(this.get_cookie_instance(options.identifier)) options.restore = true;
		this.parent(options);
		//Saving session when page unload
		window.addEvent('unload',function(){
			if(this.get_sessid()){
				//Saving session without tagging it and make it synchronous
				this.save_session(false,false);
				//Save frequency of ape instance in cookie
				Cookie.write('Ape_restore',this.options.frequency,{domain:this.options.domain});
			}
		}.bind(this));
		this.add_event('initialized',this.initialized);
		this.add_event('raw_sessions',this.restore_session);
		this.add_event('raw_king',this.raw_king);
		this.add_event('raw_update',this.send_update);
	},
	raw_king: function(param){
		this.request('KONG',[param.datas.value]);
	},
	send_update: function(){
		this.save_session(true);
	},
	save_session: function(tag,async){
		this.fire_event('save_session');
		tag = tag || false;
		if(!$type(async)) async = true;
		var tmp = this.pipes.getValues();
		this.sessions.pipes = new Array();
		this.sessions.sessid = this.get_sessid();
		this.sessions.user = this.user;
		this.pipes.each(function(pipe){
			//fire event on each pipe
			this.fire_event('save_pipe',pipe);
			if(pipe.sessions){
				pipe.sessions.type = pipe.type;
				pipe.sessions.pipe = pipe.pipe;
				if(pipe.users){
					pipe.sessions.users = pipe.users.getValues();
				}
				this.sessions.pipes.push(pipe.sessions);
			}
		}.bind(this));
		this.save_cookie();
		this.set_session('param',JSON.encode(this.sessions),{'tag':tag,'async':async});
	},
	request: function(raw,param,sessid,options){
		if(raw!='CHECK'){
			//remove restore cookie if informations is exchanged with server
			Cookie.dispose('Ape_restore',{domain:this.options.domain});
		}
		this.parent(raw,param,sessid,options);
	},
	initialized :function(){
		this.create_cookie();
		this.save_cookie();
		Cookie.dispose('Ape_restore',{domain:this.options.domain});
	},
	connect:function(options){
		var cookie = this.init_cookie();
		if(!cookie){//No cookie defined start a new connection
			this.parent(options);
		}else{//Cookie or instance exist
			if(this.options.direct_restore){//Simple session restore
				this.get_session('param');//Get saved session
			}else{//Complex session restore
				//User opened a new tab/window
				this.check();//Send a check raw (this ask ape for an updated session)
			}
		}
	},
	restore_session: function(raw){
		this.fire_event('initialized');
		var sessions = JSON.decode(unescape(raw.datas.sessions.param));
		this.fire_event('start_restore',sessions);
		this.user = sessions.user;
		var l = sessions.pipes.length;
		for(var i = 0;i<l;i++){
			var pipe;
			if(sessions.pipes[i].type=='uni'){
				pipe = new Ape_pipe_single(this,sessions.pipes[i]);
			}else{
				pipe = new Ape_pipe_multi(this,sessions.pipes[i]);
			}
		}
		this.start_pooler();
		this.fire_event('end_restore',sessions);
	},
	save_cookie: function(){
		//Update frequency
		var tmp = JSON.decode(Cookie.read('Ape_cookie',{domain:this.options.domain}));
		if(tmp && tmp.frequency>this.cookie.frequency) this.cookie.frequency = tmp.frequency;

		//Save it
		Cookie.write('Ape_cookie',JSON.encode(this.cookie),{domain:this.options.domain});
	},
	clear_session: function(){
		this.parent();
		window.removeEvent('unload');
		this.remove_cookies();
	},
	remove_cookies: function(){
		Cookie.dispose('Ape_cookie',{domain:this.options.domain});
		Cookie.dispose('Ape_restore',{domain:this.options.domain});
	},
	/***
	 * Read the cookie Ape_cookie and try to find the application identifier
	 * @param	string	identifier	
	 * 		Can be used to force the identifier to find ortherwhise 
	 * 		identifier defined in the options will be used
	 * @return false if application identifier isn't found or an object with the instance and the cookie
	 */
	get_cookie_instance: function(identifier){
		var 	tmp = Cookie.read('Ape_cookie'),
			identifier = identifier || this.options.identifier;
		if(tmp){
			tmp = JSON.decode(tmp);
			//Get the instance of ape in cookie
			for(var i = 0;i<tmp.instance.length;i++){
				if(tmp.instance[i].identifier==identifier){
					return {'instance':tmp.instance[i],'cookie':tmp};
				}
			}
		}
		//no instance found for the identifier 
		return false;
	},
	/***
	 * Init cookie
	 * @return	boolean	false if there were no cookie or instance else true
	 */
	init_cookie: function(){
		var tmp = this.get_cookie_instance();
		if(tmp){
			this.set_sessid(tmp.instance.sessid);
			tmp.cookie.frequency = tmp.cookie.frequency.toInt()+1;
			this.cookie = tmp.cookie;
			return tmp;
		}else{
			this.cookie = null;
			return false;
		}
	},
	/***
	 * Create ape cookie if needed (but do not write it)
	 */
	create_cookie: function(){
		if(!this.cookie){
			//No Cookie or no ape instance in cookie, lets create the cookie
			tmp = {};
			tmp.frequency = 1;
			tmp.instance  = new Array();
			tmp.instance.push({'identifier':this.options.identifier,'sessid':this.get_sessid()});
			this.cookie = tmp;
		}
	}
});
