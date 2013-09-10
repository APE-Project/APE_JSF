/**
 * @name APE.PipeSingle
 * @public
 * @augments APE.Pipe
 * @class
 * @see APE.Pipe
 * @see APE.PipeMulti
 * @see APE.PipeProxy
 * @fires APE.uniPipeCreate
*/
APE.PipeSingle = new Class({
	Extends: APE.Pipe,
	initialize: function(core, options) {
		this.parent(core, options);
		this.type = 'uni';
		this.ape.fireEvent('uniPipeCreate', [this, options]);
	}
});
