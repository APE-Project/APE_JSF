APE.Controller = new Class({
	
	Extends: APE.Client,
	
	Implements: Options,
	
	options: {
		container: null
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.container = $(this.options.container) || document.body;

		this.onRaw('action', this.onAction);
		this.addEvent('load',this.start);
	},
	
	start: function(core){
		this.core.start('test');
	},
	
	onAction: function(raw, pipe){
		new Element('div', {
			'class': 'message',
			html: decodeURIComponent(raw.datas.value)
		}).inject(this.container);
	}
	
});
