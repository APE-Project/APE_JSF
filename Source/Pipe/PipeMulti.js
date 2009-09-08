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

		this.fireEvent('pipeCreate', [this.type, this, options]);

		if (options.users) {
			var l = users.length;
			for (var i=0; i < l; i++) {
				this.addUser(users[i].pubid, users[i]);
			}
			this.onRaw('pipe:left', this.rawLeft);
			this.onRaw('pipe:join', this.rawJoin);
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
		this.fireEvent('userJoin', [u, this]);
		return u;
	},

	delUser: function(pubid) {
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		this.fireEvent('userLeft', [u, this]);
		return u;
	},

	getUser: function(pubid) {
		return this.users.get(pubid);
	},
	
	getUserPipe: function(pubid) {
		return this.ape.newPipe('uni', this.users.get(pubid));
	}
});
