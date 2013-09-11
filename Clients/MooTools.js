/**
 * APE_JSF
 * @fileOverview APE JSF
 * http://www.ape-project.org/
 * Weelya <contact _at_ weelya _dot_ com>
 * @author Nicolas Trani (efyx)
 * @author Anthony Catel (paraboul)
 * @author Florian Gasquez (Fy-)
 * @author John Chavarria (psi)
 */

var APE = {
	Config: {
		identifier: 'ape',
		init: true,
		frequency: 0,
		scripts: []
	}
};
/**
* Client
*
* @name APE.Client
* @class
* @public
* @constructor
*
* @param {object} [core] Core object
* @returns {void}
*
* @property {Cookie} cookie Cookie object
*
* @see APE.Core
* @see APE.client
*/

APE.Client = new Class({
	eventProxy: [],
	/**
	 * Fire a event manually.
	 * <p>Executes all events of the specified type present on the APE core and Pipes.</p>
	 *
	 * @name APE.fireEvent
	 * @function
	 * @public
	 *
	 * @param {string} eventName Event to launch (eg 'load').
	 * @param {Array|object} args The arguments for the appropiate event callbacks
	 * @param {integer} [delay] Delay in ms before the event should be fired
	 * @returns {APE}
	 *
	 * @example
	 * //ape var is a reference to APE instance
	 * //fire the event "myEvent" with arguments "argument1" and "argument2" and delay it of 1sec
	 * ape.fireEvent('myEvent', ['argument1', 'argument2'], 1000);
	 *
	 * @see APE.fireEvent
	 * @see APE.addEvent
	 * @see APE.Pipe.addEvent
	 * @see APE.Pipe.fireGlobalEvent
	 */
	fireEvent: function(type, args, delay) {
		return this.core.fireEvent(type, args, delay);
	},
	/**
	 * Intercept an event.
	 *
	 * @name APE.addEvent
	 * @function
	 * @public
	 *
	 * @param {string} eventName Event to listen to.
	 * @param {function} fn The function that will be executed upon this named event
	 * @param {boolean} [internal] Flag to hide the function
	 * @returns {APE}
	 *
	 * @example
	 * //Initialize client
	 * client = new APE.Client();
	 * client.load({
	 * 	'domain': 'yourdomain.com',
	 * 	'server': 'ape.yourdomain.com',
	 * 	'baseUrl': 'yourdomain.com/APEJavaScript'
	 * });
	 * //Load event is fired when the client is loaded
	 * client.addEvent('load', function() {
	 * 	console.log('APE is loaded');
	 * 	//Ok my client is loaded, now i can send data to my APE server
	 * 	//Connect to the APE server
	 * 	client.core.start();
	 * });
	 * //Init event is fired when the client is connected to APE server
	 * client.addEvent('init', function() {
	 * 	console.log('APE is connected');
	 * });
	 *
	 * @see APE.addEvent
	 * @see APE.fireEvent
	 * @see APE.Pipe.addEvent
	 * @see APE.removeEvent
	 */
	addEvent: function(type, fn, internal) {
		var newFn = fn.bind(this), ret = this;
		if (!$defined(this.core)) this.eventProxy.push([type, fn, internal]);
		else {
			ret = this.core.addEvent(type, newFn, internal);
			this.core.$originalEvents[type] = this.core.$originalEvents[type] || [];
			this.core.$originalEvents[type][fn] = newFn;
		}
		return ret;
	},
	onRaw: function(type, fn, internal) {
		return this.addEvent('raw_' + type.toLowerCase(), fn, internal);
	},
	/**
	 * Stop watching a event
	 *
	 * @name APE.removeEvent
	 * @function
	 * @public
	 *
	 * @param {string} eventName The name of the event (e.g. 'login', 'data');
	 * @param {function} [fn] For internal functions?
	 * @returns {APE}
	 *
	 * @example
	 * //ape var is a reference to APE instance
	 * //Intercept login raw.
	 * ape.onRaw('level10', function(param) {
	 * 	ape.removeEvent('level9');
	 * });
	 * @see APE.addEvent
	 */
	removeEvent: function(type, fn) {
		return this.core.removeEvent(type, fn);
	},
	onCmd: function(type, fn, internal) {
		return this.addEvent('cmd_' + type.toLowerCase(), fn, internal);
	},
	onError: function(type, fn, internal) {
		return this.addEvent('error_' + type, fn, internal);
	},
	load: function(config) {
		config = $merge({}, APE.Config, config);
		// Init function called by core to init core variable
		config.init = function(core) {
			this.core = core;
			for (var i = 0; i < this.eventProxy.length; i++) {
				this.addEvent.apply(this, this.eventProxy[i]);
			}
		}.bind(this);
		//set document.domain
		if (config.transport != 2) {
			if (config.domain != 'auto') document.domain = config.domain;
			if (config.domain == 'auto') document.domain = document.domain;
		}
		var tmp	= JSON.decode(Cookie.read('APE_Cookie'), {'domain': document.domain});
		if (tmp) {
			config.frequency = tmp.frequency.toInt();
		} else {
			tmp = {'frequency': 0};
		}
		tmp.frequency = config.frequency + 1;
		Cookie.write('APE_Cookie', JSON.encode(tmp), {'domain': document.domain});
		var iframe = new Element('iframe', {
			id: 'ape_' + config.identifier,
			styles: {
				display: 'none',
				position: 'absolute',
				left: -300,
				top: -300
			}
		}).inject(document.body);
		iframe.addEvent('load', function() {
			if (!iframe.contentWindow.APE) setTimeout(iframe.onload, 100);//Sometimes IE fire the onload event, but the iframe is not loaded -_-
			else iframe.contentWindow.APE.init(config);
		});
		if (config.transport == 2) {//Special case for JSONP
			var doc = iframe.contentDocument;
			if (!doc) doc = iframe.contentWindow.document;
			//If the content of the iframe is created in DOM, the status bar will always load...
			//using document.write() is the only way to avoid status bar loading with JSONP
			doc.open();
			var theHtml = '<html><head>';
			for (var i = 0; i < config.scripts.length; i++) {
				theHtml += '<script src="' + config.scripts[i] + '"></script>';
			}
			theHtml += '</head><body></body></html>';
			doc.write(theHtml);
			doc.close();
		} else {
			iframe.set('src', (config.secure ? 'https' : 'http') + '://' + config.frequency + '.' + config.server + '/?[{"cmd":"script","params":{"domain":"' + document.domain + '","scripts":["' + config.scripts.join('","') + '"]}}]');
			if (Browser.Engine.gecko) {
				// Firefox fix, see bug  #356558
				// https://bugzilla.mozilla.org/show_bug.cgi?id=356558
				iframe.contentWindow.location.href = iframe.get('src');
			}
		}
	}
});
