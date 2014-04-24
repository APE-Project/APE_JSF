
/**
 * Create a new APE instance.
 * <p>The constuctor only create a APE instance, to connect to the APE server you need to use the start(); method</p>
 * <p>If you want to use APE, do NOT start APE in this way, use APE.load() method instead.</p>
 *
 * @name APE
 * @class
 * @augments-APE.Events
 * @public
 *
 * @property {string} version Version (e.g. 1.1)
 * @property {APE.Request} request Request object
 * @property {APE.Request.stack } request.stack Request stack
 * @property {APE.Request.cycledStack } request.cycledStack Cycled request stack
 * @property {APE.Transport} transport Transport variant
 * @property {APE.Client} client Client object
 * @property {APE.Core} core Core object
 *
 * @param {object} [options] An object with ape default options
 * @param {string} [options.server] APE server URL
 * @param {integer} [options.pollTime=25000] Max time for a request in ms
 * @param {string} [options.identifier='ape'] Identifier used to differentiate two APE instance when you are using more than one application on your website and using Session.js
 * @param {integer} [options.transport=1] Transport method used by APE,<p>
 *   1 : Long polling<br/>
 *   2 : XHR streaming<br/>
 *   3 : forever iframe<br/>
 *   4 : JSONP<br/>
 *   6 : Websocket<br/></p>
 * @param {integer} [options.frequency=0] The frequency identifier
 * @returns APE An Ape instance
 *
 * @example
 * var ape = new APE.Core({
 * 	'server': 'ape.yourdomain.com'
 * });
 * @example
 * var ape = new APE.Core({
 * 	'server': 'ape.yourdomain.com',
 * 	'pollTime': 35000, //if you set pollTime to 35sec you need to set it on the server side to 55sec
 * 	'identifier': 'myApplicationIdentifier',
 * 	'transport': 2,
 * 	'frequency': 3
 * });
 * ape.start();
 * client.addEvent('load', function() {
 * 	console.log(ape.user.pubid); //Show pubid of current user
 * 	console.log(ape.user.properties); //Show properties of current user
 * }
 *
 * @see APE.client
 * @see APE.load
 * @see APE.start
 * @see APE.onError
 * @see APE.onRaw
 */


var APE = {
	'version': '1.1',
	'Request': {},
	'Transport': {}
};
