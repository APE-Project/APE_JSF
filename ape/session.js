var Ape_core = new Class({

	Extends: Ape_core,

	initialize: function(options){
		this.sessions = {};
		if (this.get_cookie_instance(options.identifier).instance) options.restore = true;
		this.parent(options);
		this.add_event('initialized',this.initialized);
		this.add_event('new_pipe_single',this.save_pipe_single);
		this.add_event('pipe_single_deleted',this.pipe_single_deleted);
		this.single_pipe = new $H;
	},
	
	save_session_pipe:function(){
		this.set_session('single_pipe',JSON.encode(this.single_pipe.getValues()));
	},
	save_pipe_single: function(pipe, options) {
		this.single_pipe.set(pipe.get_pubid(), options);
		this.save_session_pipe();
	},

	pipe_single_deleted: function(pipe) {
		this.single_pipe.erase(pipe.get_pubid());
		this.save_session_pipe();
	},

	restore_single_pipe: function(resp){
		if(resp.raw=='SESSIONS'){
			var pipes = JSON.decode(unescape(resp.datas.sessions.single_pipe));
			if (pipes) {
				for (var i = 0; i < pipes.length; i++){
					this.new_pipe_single(pipes[i]);
				}
			}
		}
		this.fire_event('end_restore');
		this.restoring = false;
	},

	initialized: function(){
		this.init_cookie();
		this.create_cookie();//Create cookie if needed
		this.save_cookie();//Save cookie
	},
	callback_check: function(resp){
		if (resp.raw!='ERR' && !this.running) { 
			this.fire_event('initialized');
			this.running = true;
			this.get_session('single_pipe',this.restore_single_pipe.bind(this));
			this.start_pooler();
		}
	},
	connect:function(options){
		var cookie = this.init_cookie();
		if(!cookie){//No cookie defined start a new connection
			this.parent(options);
		}else{//Cookie or instance exist
			this.restoring = true;
			this.fire_event('start_restore');
			this.check(this.callback_check.bind(this));//Send a check raw (this ask ape for an updated session)
		}
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
			for(var i = 0; i < tmp.instance.length; i++){
				if(tmp.instance[i].identifier == identifier){
					return {'instance': tmp.instance[i], 'cookie': tmp};
				}
			}
			//No instance found, just return the cookie
			return {'cookie':tmp};
		}
		//no instance found, no cookie found 
		return false;
	},
	/***
	 * Initialize cookie and some application variable is instance is found
	 * set this.cookie variable
	 * @return 	boolean	true if instance is found, else false
	 */
	init_cookie: function(){
		var tmp = this.get_cookie_instance();
		if(tmp && tmp.instance){
			this.set_sessid(tmp.instance.sessid);
			this.set_pubid(tmp.instance.pubid);
			tmp.cookie.frequency = tmp.cookie.frequency.toInt() + 1;
			this.cookie = tmp.cookie;
			return true;
		} else if (tmp.cookie) {
			this.create_cookie_instance(tmp.cookie);
			tmp.cookie.frequency = tmp.cookie.frequency.toInt() + 1;
			this.cookie = tmp.cookie;
			return false;
		} else {
			this.cookie = null;
			return false;
		}
	},
	/***
	 * Create a cookie instance (add to the instance array of the cookie the current application)
	 * @param	object	Ape cookie
	 */
	create_cookie_instance: function(cookie) {
		cookie.instance.push({'identifier': this.options.identifier, 'pubid': this.get_pubid(), 'sessid': this.get_sessid()})
	},
	/***
	 * Create ape cookie if needed (but do not write it)
	 */
	create_cookie: function(){
		if(!this.cookie){
			//No Cookie or no ape instance in cookie, lets create the cookie
			tmp = {
				frequency: 1,
				instance: []
			};
			this.create_cookie_instance(tmp);
			this.cookie = tmp;
		}
	},
	save_cookie: function(){
		//Save it
		Cookie.write('Ape_cookie', JSON.encode(this.cookie), {domain:this.options.domain});
	},
	clear_session: function(){
		this.parent();
		this.remove_cookies();
	},
	remove_cookies: function(){
		Cookie.dispose('Ape_cookie', {domain:this.options.domain});
	}
});
