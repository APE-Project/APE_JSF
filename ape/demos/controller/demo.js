var APE_Controller = new Class({
 
	Implements: [APE_Client, Options],
	options:{
		container: document.body,
		logs_limit:10
	},
 
 
	initialize: function(core, options){
		this.core = core; 
 
		this.setOptions(options);
		this.els = {};
 
		this.onRaw('mailnotif', this.raw_data);

		this.core.start({0:'tata',1:'tatie'});
	},
 
	raw_data: function(raw, pipe){
          new Element('div', {
            'html': decodeURIComponent(raw.datas.value), 
            'class': 'css_class'
          }).inject(this.options.container);
	}
});
