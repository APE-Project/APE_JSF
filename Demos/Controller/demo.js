APE.Controller = new Class({
	
	Extends: APE.Client,
	
	Implements: Options,
	
	options: {
		container: null
	},
	
	initialize: function(options){
		this.setOptions(options);
		
		this.container = $(this.options.container) || document.body;
	},
	
	start: function(core){
		this.core = core;
		
		this.onRaw('action', this.onAction);
		
		this.core.start();
	},
	
	onAction: function(raw, pipe){
		new Element('div', {
			'class': 'message',
			html: decodeURIComponent(raw.datas.value)
		}).inject(this.container);
	}
	
});