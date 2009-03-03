var Ape_pipe_multi = new Class({
	Extends: Ape_pipe,
	initialize: function(core,options){
		this.parent(core,options);
		this.type = 'multi';
		this.name = options.pipe.properties.name;
		if(options.users){
			this.users = new $H;
			var users = options.users;
		}
		this.fire_event('new_pipe_multi',[this,options]);
		this.fire_event('new_pipe',[this,options]);
		if(options.users){
			var l = users.length;
			for(var i=0;i<l;i++){
				this.add_user(users[i].pubid,users[i]);
			}
		}
		this.add_event('raw_left',this.raw_left);
		this.add_event('raw_join',this.raw_join);
	},
	raw_join: function(pipe,raw){
		this.add_user(raw.datas.user.pubid,raw.datas.user);
	},
	raw_left: function(pipe,raw){
		this.del_user(raw.datas.user.pubid);
	},
	add_user: function(pubid,user){
		this.users.set(pubid,user);
		var u = this.users.get(pubid);
		this.fire_event('new_user',[this,u]);
		return u;
	},
	del_user: function(pubid){
		var u = this.users.get(pubid);
		this.users.erase(pubid);
		this.fire_event('user_left',[this,u]);
		return u;
	},
	get_user: function(pubid){
		return this.users.get(pubid);
	}
});
