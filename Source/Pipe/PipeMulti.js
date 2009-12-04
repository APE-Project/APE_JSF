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

		this.ape.fireEvent('multiPipeCreate', [this, options]);

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
		if (raw.data.user.pubid == this.ape.user.pubid) this.ape.delPipe(pipe.pipe.pubid);
	},

	addUser: function(pubid, user) {
		if (!this.ape.users.has(user.pubid)) {
			user.pipes = new $H;
			this.ape.users.set(pubid, user);
		} else {
			user = this.ape.users.get(pubid);
		}
		user.pipes.set(this.pipe.pubid, this);
		var u = {'pipes':user.pipes ,'casttype': user.casttype, 'pubid': user.pubid, 'properties': user.properties};
		this.users.set(pubid, u);
		this.fireGlobalEvent('userJoin', [u, this]);
		return u;
	},

	delUser: function(pubid) {
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		u.pipes.erase(this.pipe.pubid)
		if (u.pipes.getLength() == 0) {
			this.ape.users.erase(u.pubid);
		}
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
