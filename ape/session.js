var APECore = new Class({

	Extends: APECore,

	initialize: function(options){
		if (this.getInstance(options.identifier).instance) options.restore = true;
		this.parent(options);
		this.addEvent('initialized',this.initialized);
		this.addEvent('new_pipe_single',this.save_pipe_single);
		this.addEvent('pipe_single_deleted',this.pipe_single_deleted);
		this.session = {
			singlePipe: new $H
		}
	},
	
	save_session_pipe:function(){
		this.setSession('single_pipe',JSON.encode(this.session.singlePipe.getValues()));
	},

	save_pipe_single: function(pipe, options) {
		this.session.singlePipe.set(pipe.getPubid(), options);
		this.save_session_pipe();
	},

	pipe_single_deleted: function(pipe) {
		this.session.singlePipe.erase(pipe.getPubid());
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
		this.fireEvent('end_restore');
		this.restoring = false;
	},

	initialized: function(){
		this.initCookie();
		this.createCookie();//Create cookie if needed
		this.saveCookie();//Save cookie
	},

	callback_check: function(resp){
		if (resp.raw!='ERR' && !this.running) { 
			this.fireEvent('initialized');
			this.running = true;
			this.getSession('single_pipe',this.restore_single_pipe.bind(this));
			this.startPooler();
		}
	},

	connect:function(options){
		var cookie = this.initCookie();
		if(!cookie){//No cookie defined start a new connection
			this.parent(options);
		}else{//Cookie or instance exist
			this.restoring = true;
			this.fireEvent('start_restore');
			this.check(this.callback_check.bind(this));//Send a check raw (this ask ape for an updated session)
		}
	},

	/***
	 * Read the cookie APECookie and try to find the application identifier
	 * @param	String	identifier, can be used to force the identifier to find ortherwhise identifier defined in the options will be used
	 * @return 	Boolean	false if application identifier isn't found or an object with the instance and the cookie
	 */
	getInstance: function(identifier){
		var	tmp = Cookie.read('APECookie'),
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
	initCookie: function(){
		var tmp = this.getInstance();
		if(tmp && tmp.instance){
			this.setSessid(tmp.instance.sessid);
			this.setPubid(tmp.instance.pubid);
			tmp.cookie.frequency = tmp.cookie.frequency.toInt() + 1;
			this.cookie = tmp.cookie;
			return true;
		} else if (tmp.cookie) {
			this.createInstance(tmp.cookie);
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
	 * @param	object	APECookie
	 */
	createInstance: function(cookie) {
		cookie.instance.push({'identifier': this.options.identifier, 'pubid': this.getPubid(), 'sessid': this.getSessid()})
	},

	/***
	 * Create ape cookie if needed (but do not write it)
	 */
	createCookie: function(){
		if(!this.cookie){
			//No Cookie or no ape instance in cookie, lets create the cookie
			tmp = {
				frequency: 1,
				instance: []
			};
			this.createInstance(tmp);
			this.cookie = tmp;
		}
	},

	saveCookie: function(){
		//Save it
		Cookie.write('APECookie', JSON.encode(this.cookie), {domain:this.options.domain});
	},

	clearSession: function(){
		this.parent();
		this.removeCookie();
	},

	removeCookie: function(){
		Cookie.dispose('APECookie', {domain:this.options.domain});
	}
});
