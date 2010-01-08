String.implement({

	addSlashes: function(){
		return this.replace(/("|'|\\|\0)/g, '\\$1');
	},

	stripSlashes: function(){
		return this.replace(/\\("|'|\\|\0)/g, '$1');
	}
});

var B64 = new Hash({

	$p: '=',
	$tab: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

	/***
	 * Base 64 encode / Base 64 decode
	 * Taken from orbited project - http://www.orbited.org
	 */
	encode: function(ba){
		//  Encode a string as a base64-encoded string
		var s = [], l = ba.length;
		var rm = l%3;
		var x = l - rm;
		var t;
		for (var i = 0; i < x;){
			t = ba.charCodeAt(i++)<<16|ba.charCodeAt(i++)<<8|ba.charCodeAt(i++);
			s.push(B64.$tab.charAt((t>>>18)&0x3f)); 
			s.push(B64.$tab.charAt((t>>>12)&0x3f));
			s.push(B64.$tab.charAt((t>>>6)&0x3f));
			s.push(B64.$tab.charAt(t&0x3f));
		}
		// deal with trailers, based on patch from Peter Wood.
		switch (rm){
			case 2:
				t = ba.charCodeAt(i++)<<16|ba.charCodeAt(i++)<<8;
				s.push(B64.$tab.charAt((t>>>18)&0x3f));
				s.push(B64.$tab.charAt((t>>>12)&0x3f));
				s.push(B64.$tab.charAt((t>>>6)&0x3f));
				s.push(B64.$p);
			break;
			case 1:
				t = ba.charCodeAt(i++)<<16;
				s.push(B64.$tab.charAt((t>>>18)&0x3f));
				s.push(B64.$tab.charAt((t>>>12)&0x3f));
				s.push(B64.$p);
				s.push(B64.$p);
			break;
		}

		return s.join(''); // string
	},

	decode: function(str){
		var s = str.split(''), out = [];
		var l = s.length;
		var tl = 0;
		while(s[--l] == B64.$p){ ++tl; } // strip off trailing padding
		for (var i = 0; i < l;){
			var t = B64.$tab.indexOf(s[i++])<<18;
			if(i <= l) t|=B64.$tab.indexOf(s[i++])<<12;
			if(i <= l) t|=B64.$tab.indexOf(s[i++])<<6;
			if(i <= l) t|=B64.$tab.indexOf(s[i++]);
			out.push(String.fromCharCode((t>>>16)&0xff));
			out.push(String.fromCharCode((t>>>8)&0xff));
			out.push(String.fromCharCode(t&0xff));
		}
		// strip off trailing padding
		while(tl--){ out.pop(); }
		return out.join(''); //  string
	}
});
//Override setInterval to be done outside the frame (there is some issue inside the frame with FF3 and WebKit)
if (!Browser.Engine.trident && !Browser.Engine.presto && !(Browser.Engine.gecko && Browser.Engine.version<=18)) {
	setInterval = function(fn,time) {
		return window.parent.setInterval(fn, time);
	};
	
	setTimeout = function(fn,time) {
		return window.parent.setTimeout(fn, time);
	};
	
	clearInterval = function(id) {
		return window.parent.clearInterval(id);
	};
	
	clearTimeout = function(id) {
		return window.parent.clearTimeout(id);
	};
}
