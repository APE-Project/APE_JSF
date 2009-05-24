APE.Controller = new Class({
	
	Implements: [APE.Client, Options],
	
	options:{
		container: null,
		logs_limit: 10
	},
	
	
	initialize: function(core, options){
		this.core = core; 
 		
		this.setOptions(options);
		this.options.container = $(this.options.container) || document.body;
		this.els = {};
 		
		this.onRaw('mailnotif', this.raw_data);
		
		this.core.start();
	},
	
	raw_data: function(raw, pipe){
		new Element('div', {
			'class': 'css_class',
			'html': decodeURIComponent(raw.datas.value)
		}).inject(this.options.container);
	}
	
});
