var APEPipeSingle = new Class({

	Extends: APEPipe,

	initialize: function(core, options){
		this.parent(core, options);
		this.type = 'uni';
		this.fire_event('new_pipe_single',[this, options]);
		this.fire_event('new_pipe',[this, options]);
	}
});
