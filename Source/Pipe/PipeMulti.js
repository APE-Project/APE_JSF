APE.PipeMulti = new Class({

	Extends: APE.Pipe,

	initialize: function(core, options) {
		this.parent(core, options);

		this.type = 'multi';
		this.name = options.pipe.properties.name;

		//Test if pipe have users before sending event
		//because this.users need to be defined
		if (options.users) {
			this.users = new $H;
			var users = options.users;
		}

		this.ape.fireEvent('pipeCreate', [this.type, this, options]);

		if (options.users) {
			var l = users.length;
			for (var i=0; i < l; i++) {
				this.addUser(users[i].pubid, users[i]);
			}
			this.onRaw('left', this.rawLeft);
			this.onRaw('join', this.rawJoin);
		}
	},

	rawJoin: function(raw, pipe) {
		this.addUser(raw.data.user.pubid, raw.data.user);
	},

	rawLeft: function(raw, pipe) {
		this.delUser(raw.data.user.pubid);
	},

	addUser: function(pubid, user) {
		this.users.set(pubid, user);
		var u = this.users.get(pubid);
		this.fireGlobalEvent('userJoin', [u, this]);
		return u;
	},

	delUser: function(pubid) {
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		this.fireGlobalEvent('userLeft', [u, this]);
		return u;
	},

	getUser: function(pubid) {
		return this.users.get(pubid);
	},
	
	getUserPipe: function(user) {
		if (typeof user == 'string') user = this.users.get(users.pubid);
		return this.ape.newPipe('uni', {'pipe':user});
	}
});
