APE.Core = new Class({

	Extends: APE.Core,

	initialize: function(options){
		if (this.getInstance(options.identifier).instance) options.restore = true;

		this.options.sessionVar = ['uniPipe']; 
		this.parent(options);

		//Init and save cookies
		if (options.restore) this.init();

		this.addEvent('uniPipeCreate',this.saveSessionPipe);
		this.addEvent('uniPipeDelete',this.saveSessionPipe);
	},
	
	saveSessionPipe:function(){
		var uniPipe = [];
		this.pipes.each(function(pipe) {
				if (pipe.type == 'uni') {
					uniPipe.push({'casttype':pipe.type, 'pubid':pipe.pipe.pubid, 'properties':pipe.properties});
				}
		});
		uniPipe = escape(JSON.encode(uniPipe));
		if (this.options.transport == 2) uniPipe = escape(uniPipe); 

		if (uniPipe.length > 0) this.setSession({'uniPipe': uniPipe});

	},

	restoreUniPipe: function(resp){
		if(resp.raw == 'SESSIONS'){
			var pipes = JSON.decode(unescape(resp.data.sessions.uniPipe));
			if (pipes) {
				for (var i = 0; i < pipes.length; i++){
					this.newPipe('uni',{'pipe': pipes[i]});
				}
			}
			this.fireEvent('restoreEnd');
			this.restoring = false;
		}
	},

	init: function(){
		this.initCookie();
		this.createCookie();//Create cookie if needed
		this.saveCookie();//Save cookie
	},

	restoreCallback: function(resp){
		if (resp.raw!='ERR' && this.status == 0) { 
			this.fireEvent('init');
			this.status = 1;
			this.request.setOptions({'callback': this.restoreUniPipe.bind(this)});
		} else if (resp.raw == 'SESSIONS') { 
			this.restoreUniPipe(resp);
		} else if (this.status == 0) {
			this.stopPoller();
		}
	},

	connect: function(options){
		var cookie = this.initCookie();
		if (!cookie) {//No cookie defined start a new connection
			this.parent(options);
			this.addEvent('init',this.init);
		} else {//Cookie or instance exist
			this.restoring = true;
			this.fireEvent('restoreStart');
			this.startPoller();
			this.request.setOptions({'callback': this.restoreCallback.bind(this)});
			this.getSession(this.options.sessionVar);
		}
	},

	/***
	 * Read the cookie APE_Cookie and try to find the application identifier
	 * @param	String	identifier, can be used to force the identifier to find ortherwhise identifier defined in the options will be used
	 * @return 	Boolean	false if application identifier isn't found or an object with the instance and the cookie
	 */
	getInstance: function(identifier) {
		var	tmp = Cookie.read('APE_Cookie');
		identifier = identifier || this.options.identifier;
		if (!tmp) return false;

		tmp = JSON.decode(tmp);
		
		//Cookie is corrupted or doest not contains instance
		if (!tmp || !tmp.instance) return false;
		//Get the instance of ape in cookie
		for(var i = 0; i < tmp.instance.length; i++){
			if(tmp.instance[i] && tmp.instance[i].identifier == identifier){
				return {instance: tmp.instance[i], cookie: tmp};
			}
		}
		
		//No instance found, just return the cookie
		return {cookie: tmp};
	},
	
	removeInstance: function(identifier){
		if (!this.cookie) return;

		for(var i = 0; i < this.cookie.instance.length; i++){
			if(this.cookie.instance[i].identifier == identifier){
				this.cookie.instance.splice(i,1);
				return;
			}
		}
	},

	/***
	 * Initialize cookie and some application variable is instance is found
	 * set this.cookie variable
	 * @return 	boolean	true if instance is found, else false
	 */
	initCookie: function(){
		var tmp = this.getInstance();
		if(tmp && tmp.instance){ //Cookie exist, application instance exist
			this.sessid = tmp.instance.sessid;
			this.pubid = tmp.instance.pubid;
			tmp.cookie.frequency = tmp.cookie.frequency.toInt() + 1;
			this.cookie = tmp.cookie;
			return true;
		} else if (tmp.cookie) { //Cookie exist, no application instance
			this.createInstance(tmp.cookie);
			tmp.cookie.frequency = tmp.cookie.frequency.toInt() + 1;
			this.cookie = tmp.cookie;
			return false;
		} else { //No cookie
			this.cookie = null;
			return false;
		}
	},

	/***
	 * Create a cookie instance (add to the instance array of the cookie the current application)
	 * @param	object	APE_Cookie
	 */
	createInstance: function(cookie) {
		cookie.instance.push({
			identifier: this.options.identifier,
			pubid: this.getPubid(),
			sessid: this.getSessid()
		});
	},

	/***
	 * Create ape cookie if needed (but do not write it)
	 */
	createCookie: function(){
		if(!this.cookie){
			//No Cookie or no ape instance in cookie, lets create the cookie
			var tmp = {
				frequency: 1,
				instance: []
			};
			this.createInstance(tmp);
			this.cookie = tmp;
		}
	},

	saveCookie: function(){
		Cookie.write('APE_Cookie', JSON.encode(this.cookie), {domain:this.options.domain});
	},

	clearSession: function(){
		this.parent();
		this.removeInstance(this.options.identifier);
		this.saveCookie();
	},

	removeCookie: function(){
		Cookie.dispose('APE_Cookie', {domain:this.options.domain});
	}
});
