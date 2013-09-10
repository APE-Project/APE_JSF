/**
* Request.cycledStack object
* APE JSF allows you to create "cycled stacks" of request.
* These methods are very useful for example if your application must send different commands to APE server from several functions (or not) and you want to send them all at once.
* With request.cycledStack you don't have to care when the command are sent. They are automatically sent (by default each 350ms). This is verry useful for peridical stuff. Or to reduce/optimze bandwith.
*
* @name APE.Request.cycledStack
* @public
* @namespace
* @function
* @see APE.Request.stack
* @see APE.request.stack
* @see pipe.stack
*/
APE.Request.CycledStack = new Class({
	initialize: function(ape) {
		this.ape = ape;
		this.stack = [];
		this.reajustTime = false;
		this.timer = this.send.periodical(this.ape.options.cycledStackTime, this);
	},
	/**
	* Add a command to cycled request stack
	*
	* @name APE.Request.cycledStack.add
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
	* //Note : this example use the server module mouseMotion available on APE Store
	* // capture mousemove event
	* document.onmousemove=getMouseCoordinates;
	* //Add to the cycled Stack the position of the mouse, and the time
	* function getMouseCoordinates(event) {
	* 	ev = event || window.event;
	* 	ape.request.cycledStack.add('mouseMotion', {"x":ev.x, "y":ev.y});
	* 	captureMouse = false;
	* }
	* //Intercept mouseMotion raw, and display where the mouse was
	* ape.onRaw('mouseMotion', function(data) {
	* 	console.log('Mouse position, x : ' + data.x + ' / y : ' + data .y);
	* });
	*
 	* @see APE.Request.send
 	* @see APE.Request.stack.send
 	* @see APE.Request.cycledStack.send
	*/
	add: function(cmd, params, sessid) {
		this.stack.push({'cmd': cmd, 'params': params, 'sessid': sessid});
	},
	/**
	* Change cycled stack time. By default request added through request.cycledStack.add are sent each 350ms. This function allow you to ajust this time.
	*
	* @name APE.Request.cycledStack.setTime
	* @function
	* @public
	*
	* @param {integer} time New cycle interval in ms
	* @param {boolean} [now=false] Send immediately
	*
	* @example
	* //ape var is a reference to APE instance
	* //Set cycle stack time to 100 ms
	* ape.request.cycledStack.setTime(100);
	*/
	setTime: function(time, now) {
		if (now) {
			this.send();
			$clear(this.timer);
			this.timer = this.send.periodical(time, this);
			this.reajustTime = false;
		}
		else this.reajustTime = time;
	},
	/**
	* Force the sending of the request stack
	*
	* @name APE.Request.cycledStack.send
	* @function
	* @public
	*
	* @example
	* //ape var is a reference to APE instance
	* //Add two request to the stack
	* ape.request.cycledStack.add('testCommand', {"param1":"value"});
	* ape.request.cycledSstack.add('anotherCommand', {"param1":"value"});
	* //Imediately send the stack to APE server
	* ape.request.cycledStack.send();
	*
	* @see APE.Request.send
 	* @see APE.Request.cycledStack.add
 	* @see APE.Request.stack.add
	*/
	send: function() {
		if (this.stack.length > 0) {
			this.ape.request.send(this.stack);
			this.stack = [];
			if (this.reajustTime) {
				this.setTime(this.reajustTime, true);
			}
		}
	}
});
