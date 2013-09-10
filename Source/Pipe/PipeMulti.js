/**
 * PipeMulti object
 *
 * @name APE.PipeMulti
 * @class
 * @public
 * @augments APE.Pipe
 *
 * @see APE.Pipe
 * @see APE.PipeMulti
 * @see APE.PipeProxy
 *
 * @fires APE.multiPipeCreate
 */

/**
 * A MooTools hash of user on the pipe.
 * <p>If you use this variable in the multiPipeCreate events it will be empty.</p>
 * <p>If you want to access to all user on pipe in the multiPipeCreate event use the <b>options.users</b> <i>(object)</i> (second parameter passed to multiPipeCreate event)</p>
 *
 * @name APE.PipeMulti.users
 * @public
 * @property {Hash} A MooTools hash of user on the pipe.
 *
 * @see APE.multiPipeCreate
 */
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
			for (var i = 0; i < l; i++) {
				this.addUser(users[i].pubid, users[i]);
			}
		}
		this.onRaw('left', this.rawLeft);
		this.onRaw('join', this.rawJoin);
	},
	rawJoin: function(raw, pipe) {
		this.addUser(raw.data.user.pubid, raw.data.user);
	},
	rawLeft: function(raw, pipe) {
		if (pipe.name.charAt(0) != '*') this.delUser(raw.data.user.pubid);
		if (raw.data.user.pubid == this.ape.user.pubid) this.ape.delPipe(pipe.pipe.pubid);
	},
	/**
	* Force this user to leave this pipe
	*
	* @name APE.PipeMulti.left
	* @public
	* @function
	*
	* @returns {void}
	*
	* @example
	* //ape var is a reference to APE instance
	* //Join testchannel
	* ape.join('testchannel');
	* //Intercept pipeCreate event (this event is fired when you join a channel)
	* ape.addEvent('multiPipeCreate', function(pipe, options) {
	* 	if (pipe.properties.name=='teschannel') {
	* 		//If pipe is testchannel, left it :p
	* 		pipe.left();
	* 	}
	* });
	*/
	left: function() {
		this.ape.left(this.pipe.pubid);
	},
	/**
	* Add another user to this pipe
	*
	* @name APE.PipeMulti.addUser
	* @public
	* @function
	*
	* @param {string} pubid A user's pubid
	* @param {object} updatedUser An updated user object
	* @returns {user} user object
	*
	* @see APE.PipeMulti.getUserPipe
	* @see APE.PipeMulti.getUser
	* @see APE.PipeMulti.delUser
	*/
	addUser: function(pubid, updatedUser) {
		var user;
		if (!this.ape.users.has(pubid)) {
			user = updatedUser;
			user.pipes = new $H;
			this.ape.users.set(pubid, updatedUser);
		} else {
			user = this.ape.users.get(pubid);
		}
		user.pipes.set(this.pipe.pubid, this);
		var u = {'pipes': user.pipes, 'casttype': user.casttype, 'pubid': user.pubid, 'properties': updatedUser.properties};
		this.users.set(pubid, u);
		this.fireGlobalEvent('userJoin', [u, this]);
		return u;
	},
	/**
	* Add another user to this pipe
	*
	* @name APE.PipeMulti.delUser
	* @public
	* @function
	*
	* @param {string} pubid A user's pubid
	* @returns {user}
	*
	* @see APE.PipeMulti.getUserPipe
	* @see APE.PipeMulti.addUser
	*/
	delUser: function(pubid) {
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		u.pipes.erase(this.pipe.pubid);
		if (u.pipes.getLength() == 0) {
			this.ape.users.erase(u.pubid);
		}
		this.fireGlobalEvent('userLeft', [u, this]);
		return u;
	},
	/**
	* Return an user object identified by his pubid.
	*
	* @name APE.PipeMulti.getUser
	* @public
	* @function
	*
	* @param {string} pubid A user's pubid
	* @returns {user} An user object (with pubid and properties) or null
	*
	* @see APE.PipeMulti.getUserPipe
	*/
	getUser: function(pubid) {
		return this.users.get(pubid);
	},
	/**
	* Return an user object identified by his pubid.
	*
	* @name APE.PipeMulti.getUserPipe
	* @public
	* @function
	*
	* @param {string|user} user A user's pubid or a user object
	* @returns {pipe} An pipe to the other user
	*
	* @see APE.PipeMulti.getUser
	*/
	getUserPipe: function(user) {
		if (typeof user == 'string') user = this.users.get(users.pubid);
		return this.ape.newPipe('uni', {'pipe': user});
	}
});
