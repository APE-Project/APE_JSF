APE.PipeSingle = new Class({

	Extends: APE.Pipe,

	initialize: function(core, options){
		this.parent(core, options);
		this.type = 'uni';
		this.fireEvent('pipeCreate',[this.type, this, options]);
	}
});
