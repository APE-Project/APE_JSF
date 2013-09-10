String.implement({
	/**
	* Add slashes to a string
	* @name String.addSlashes
	* @function
	* @public
	* @requires Mootools.String
	*/
	addSlashes: function() {
		return this.replace(/("|'|\\|\0)/g, '\\$1');
	},
	/**
	* Remove slashes from a string
	* @name String.stripSlashes
	* @function
	* @public
	* @requires Mootools.String
	*/
	stripSlashes: function() {
		return this.replace(/\\("|'|\\|\0)/g, '$1');
	}
});
/**
 * Base 64 encode / Base 64 decode
 *
 *
 * @name B64
 * @namespace
 * @author Taken from orbited project - http://www.orbited.org
 */
var B64 = new Hash({
	$p: '=',
	$tab: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	/**
	* Encode a string as a base64-encoded string
	*
	* @name B64.encode
	* @function
	* @public
	* @static
	*
	* @param {string} string string to encode
	* @returns {string} Encoded string
	*
	* @see B64.decode
	 */
	encode: function(ba) {
		var s = [], l = ba.length;
		var rm = l % 3;
		var x = l - rm;
		var t;
		for (var i = 0; i < x;) {
			t = ba.charCodeAt(i++) << 16 | ba.charCodeAt(i++) << 8 | ba.charCodeAt(i++);
			s.push(B64.$tab.charAt((t >>> 18) & 0x3f));
			s.push(B64.$tab.charAt((t >>> 12) & 0x3f));
			s.push(B64.$tab.charAt((t >>> 6) & 0x3f));
			s.push(B64.$tab.charAt(t & 0x3f));
		}
		// deal with trailers, based on patch from Peter Wood.
		switch (rm) {
			case 2:
				t = ba.charCodeAt(i++) << 16 | ba.charCodeAt(i++) << 8;
				s.push(B64.$tab.charAt((t >>> 18) & 0x3f));
				s.push(B64.$tab.charAt((t >>> 12) & 0x3f));
				s.push(B64.$tab.charAt((t >>> 6) & 0x3f));
				s.push(B64.$p);
			break;
			case 1:
				t = ba.charCodeAt(i++) << 16;
				s.push(B64.$tab.charAt((t >>> 18) & 0x3f));
				s.push(B64.$tab.charAt((t >>> 12) & 0x3f));
				s.push(B64.$p);
				s.push(B64.$p);
			break;
		}
		return s.join(''); // string
	},
	/**
	* Decode a string to a base64-encoded string
	*
	* @name B64.decode
	* @function
	* @public
	* @static
	*
	* @param {string} string string to decode
	* @returns {string} decoded string
	*
	* @see B64.encode
	*/
	decode: function(str) {
		var s = str.split(''), out = [];
		var l = s.length;
		var tl = 0;
		while (s[--l] == B64.$p) { ++tl; } // strip off trailing padding
		for (var i = 0; i < l;) {
			var t = B64.$tab.indexOf(s[i++]) << 18;
			if (i <= l) t |= B64.$tab.indexOf(s[i++]) << 12;
			if (i <= l) t |= B64.$tab.indexOf(s[i++]) << 6;
			if (i <= l) t |= B64.$tab.indexOf(s[i++]);
			out.push(String.fromCharCode((t >>> 16) & 0xff));
			out.push(String.fromCharCode((t >>> 8) & 0xff));
			out.push(String.fromCharCode(t & 0xff));
		}
		// strip off trailing padding
		while (tl--) {out.pop(); }
		return out.join(''); //  string
	}
});

randomString = function(length, chars) {
    //http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    //console.log(randomString(16, 'aA'));  //console.log(randomString(32, '#aA'));  //console.log(randomString(64, '#A!'));
    var mask = '';
    var result = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    for (var i = length; i > 0; --i) {
        result += mask[Math.round(Math.random() * (mask.length - 1))];
    }
    return result;
}

randomString = function(length, chars) {
	//http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
	//console.log(randomString(16, 'aA'));  //console.log(randomString(32, '#aA'));  //console.log(randomString(64, '#A!'));
	var mask = '';
	var result = '';
	if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
	if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if (chars.indexOf('#') > -1) mask += '0123456789';
	if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
	for (var i = length; i > 0; --i) {
		result += mask[Math.round(Math.random() * (mask.length - 1))];
	}
	return result;
};

//http://www.webtoolkit.info/javascript-sha1.html
/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
**/
function SHA1(msg) {
	function rotate_left(n, s) {
		var t4 = (n << s) | (n >>> (32 - s));
		return t4;
	};
	function lsb_hex(val) {
		var str = '';
		var i;
		var vh;
		var vl;
		for (i = 0; i <= 6; i += 2) {
			vh = (val >>> (i * 4 + 4)) & 0x0f;
			vl = (val >>> (i * 4)) & 0x0f;
			str += vh.toString(16) + vl.toString(16);
		}
		return str;
	};
	function cvt_hex(val) {
		var str = '';
		var i;
		var v;
		for (i = 7; i >= 0; i--) {
			v = (val >>> (i * 4)) & 0x0f;
			str += v.toString(16);
		}
		return str;
	};
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g, '\n');
		var utftext = '';
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};
	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;
	msg = Utf8Encode(msg);
	var msg_len = msg.length;
	var word_array = new Array();
	for (i = 0; i < msg_len - 3; i += 4) {
		j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
		msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
		word_array.push(j);
	}
	switch (msg_len % 4) {
		case 0:
			i = 0x080000000;
		break;
		case 1:
			i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
		break;
		case 2:
			i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
		break;
		case 3:
			i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
		break;
	}
	word_array.push(i);
	while ((word_array.length % 16) != 14) word_array.push(0);
	word_array.push(msg_len >>> 29);
	word_array.push((msg_len << 3) & 0x0ffffffff);
	for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
		for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
		for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for (i = 0; i <= 19; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (~ B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 20; i <= 39; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 40; i <= 59; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 60; i <= 79; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}
	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	return temp.toLowerCase();
}

try {
	//Avoid showing error if window.parent.setInterval() is not working (ie : permission denied)
	window.parent.setInterval();
	//Override setInterval to be done outside the frame (there is some issue inside the frame with FF3 and WebKit)
	if (!Browser.Engine.trident && ! Browser.Engine.presto && ! (Browser.Engine.gecko && Browser.Engine.version <= 18)) {
		setInterval = function(fn, time) {
			return window.parent.setInterval(fn, time);
		};
		setTimeout = function(fn, time) {
			return window.parent.setTimeout(fn, time);
		};
		clearInterval = function(id) {
			return window.parent.clearInterval(id);
		};
		clearTimeout = function(id) {
			return window.parent.clearTimeout(id);
		};
	}
} catch (e) {}
