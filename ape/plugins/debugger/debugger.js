var Ape_core = new Class({
	Extends:Ape_core,
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
	request: function(raw,param,options){
		var $stime = $time();
		console.log('Sending',raw,param,'time : '+$stime);
		this.parent(raw,param,options);
		var $etime = $time()-$stime;
		console.log('Sending time : '+$etime);
	},
	parse_response: function(raws){
		console.log('Receiving',raws);
		this.parent(raws);
	},
	fire_event: function(type,args,delay){
		//console.group('Fire event');
		//console.log('Type : ',type);
		//console.log('Args : ',args);
		//console.groupEnd();
		this.parent(type,args,delay);
	},
	add_event: function(type,fn,internal){
		//console.group('Register event');
		//console.log('Type : ',type);
		//console.log('Fn : ',fn);
		//console.groupEnd();
		this.parent(type,fn,internal);
	}
});
