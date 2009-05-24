var APE_PipeSingle = new Class({

	Extends: APE_Pipe,

	initialize: function(core, options){
		this.parent(core, options);
		this.type = 'uni';
		this.fireEvent('pipeCreate',[this.type, this, options]);
	}
});
