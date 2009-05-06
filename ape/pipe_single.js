var APEPipeSingle = new Class({

	Extends: APEPipe,

	initialize: function(core, options){
		this.parent(core, options);
		this.type = 'uni';
		this.fireEvent('new_pipe_single',[this, options]);
		this.fireEvent('new_pipe',[this, options]);
	}
});
