var APEPipeMulti = new Class({

	Extends: APEPipe,

	initialize: function(core, options){
		this.parent(core, options);

		this.type = 'multi';
		this.name = options.pipe.properties.name;

		//Test if pipe have users before sending event
		//because this.users need to be defined
		if (options.users) {
			this.users = new $H;
			var users = options.users;
		}

		this.fireEvent('new_pipe_multi', [this, options]);
		this.fireEvent('new_pipe', [this, options]);

		if (options.users) {
			var l = users.length;
			for (var i=0; i < l; i++) {
				this.addUser(users[i].pubid, users[i]);
			}
			this.addEvent('raw_left', this.raw_left, true);
			this.addEvent('raw_join', this.raw_join, true);
		}
	},

	raw_join: function(raw, pipe){
		this.addUser(raw.datas.user.pubid, raw.datas.user);
	},

	raw_left: function(raw, pipe){
		this.delUser(raw.datas.user.pubid);
	},

	addUser: function(pubid, user){
		this.users.set(pubid, user);
		var u = this.users.get(pubid);
		this.fireEvent('new_user', [u, this]);
		return u;
	},

	delUser: function(pubid){
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		this.fireEvent('user_left', [u, this]);
		return u;
	},

	getUser: function(pubid){
		return this.users.get(pubid);
	}
});
