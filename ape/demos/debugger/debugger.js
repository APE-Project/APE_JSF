var APECore = new Class({
	Extends:APECore,
	initialize: function(options){
		if (!window.console || !console.firebug){
			var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
			    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

			window.console = {};
			for (var i = 0; i < names.length; ++i){
				window.console[names[i]] = function() {
					var div = $(window.parent.document.createElement('div'));
					for(var j=0;j<arguments.length;j++){
						div.appendText(arguments[j]+', ');
					}
					div.inject(window.parent.document.getElementById('debug'));
				}
			}
		}
		this.parent(options);
	},
	request: function(raw,param,sessid,options,no_watch){
		console.log('Sending',raw,sessid,param,'fq',this.options.frequency);
		this.parent(raw,param,sessid,options,no_watch);
	},
	parseResponse: function(raws){
		console.log('Receiving',raws);
		this.parent(raws);
	},
	raw_err: function(err){
		console.log('Error',err);
		this.parent(err);
	}
});
