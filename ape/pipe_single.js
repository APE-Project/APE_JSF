var Ape_pipe_single = new Class({

	Extends: Ape_pipe,

	initialize: function(core,options){
		this.parent(core,options);
		this.type = 'uni';
		this.fire_event('new_pipe_single',[this,options]);
		this.fire_event('new_pipe',[this,options]);
	}
});
