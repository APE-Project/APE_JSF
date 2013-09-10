/**
* Request.stack object.
* <p>These methods are very useful for example if your application must send different commands to APE server from several functions and you want to send them all at once.</p>
*
* @name APE.Request.stack
* @public
* @function
* @namespace
* @see APE.Request.cycledStack
*/
APE.Request.Stack = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = [];
	},
	/**
	* Add a command to request stack.
	* <p>Send the request stack.</p>
	*
	* @name APE.Request.stack.add
	* @function
	* @public
	*
	* @param {Array|string} cmd If the argument is a string, it should be a CMD (e.g. 'CONNECT'). If the argument is an array: the array should contain objects with cmd, params and sessid)
	* @param {object} [params] The parameters that must be send with the command
	* @param {object} [options] Object with request options
	* @param {boolean} [options.sessid=true] Add the sessid property to the request
	* @returns {void} The request object
	*
	* @example
	* //ape var is a reference to APE instance
	* //Add two request to the stack
	* ape.request.stack.add('testCommand', {"param1":"value"});
	* ape.request.stack.add('anotherCommand', {"param1":"value"});
	* //Send the stack to APE server
	* ape.request.stack.send();
	*
	* @see APE.Request.send
	* @see APE.Request.cycledStack.send
 	* @see APE.Request.stack.add
	*/
	add: function(cmd, params, options) {
		this.stack.push({'cmd': cmd, 'params': params, 'options': options});
	},
	/**
	* Send the request stack.
	* <p>This method send the command in the request stack added trough request.stack.add to the APE server.</p>
	*
	* @name APE.Request.stack.send
	* @function
	* @public
	*
	* @returns {object} The request object
	*
	* @example
	* //ape var is a reference to APE instance
	* //Add two request to the stack
	* ape.request.stack.add('testCommand', {"param1":"value"});
	* ape.request.stack.add('anotherCommand', {"param1":"value"});
	* //Send the stack to APE server
 	* ape.request.stack.send();
 	*
 	* @see APE.Request.cycledStack.add
 	* @see APE.Request.stack.send
	*/
	send: function() {
		this.ape.request.send(this.stack);
		this.stack = [];
	}
});
