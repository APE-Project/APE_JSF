APE.Controller = new Class({
	
	Extends: APE.Client,
	
	Implements: Options,
	
	options: {
		container: null
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.container = $(this.options.container) || document.body;

		this.onRaw('postmsg', this.onMsg);
		this.addEvent('load',this.start);
	},
	
	start: function(core){
		this.core.start({'name': $time().toString()});
	},
	
	onMsg: function(raw){
		new Element('div', {
			'class': 'message',
			html: decodeURIComponent(raw.data.message)
		}).inject(this.container);
	}
	
});
