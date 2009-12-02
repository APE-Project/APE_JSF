Request.XHRStreaming = new Class({

	Extends: Request,

	lastTextLength: 0,
	read: 0, //Contain the amout of data read

	send: function(options) {
		//mootools set onreadystatechange after xhr.open. In webkit, this cause readyState 1 to be never fired
		if (Browser.Engine.webkit) this.xhr.onreadystatechange = this.onStateChange.bind(this);
		return this.parent(options);
	},

	onStateChange: function() {
		if (this.xhr.readyState == 1) this.dataSent = true;
		else if (this.xhr.readyState == 3) this.progress(this.xhr.responseText, this.xhr.responseXML);
		this.parent();
	},

	onProgress: function(){
		this.fireEvent('progress', arguments);
	},

	progress: function(text, xml){
		var length = text.length;
		this.read += length;
		text = text.substr(this.lastTextLength);
		this.lastTextLength = length;
		this.onProgress(this.processScripts(text), xml);
	}
});
APE.Transport.XHRStreaming = new Class({
	
	maxRequestSize: 100000,

	Implements: APE.Request.SSE,

	initialize: function(ape){ 
		this.ape = ape;
		this.requestFailObserver = [];

		//If browser support servent sent event, switch to SSE / XHR transport 
		if (this.SSESupport) this.ape.options.transport = 4;

		this.streamInfo = {
			timeoutObserver: null,
			cleanClose: false,
			forceClose: false,
			callback: null
		}
	},

	send: function(queryString, options) {
		if (this.SSESupport && !this.eventSource) {
			this.initSSE(queryString, options, this.readSSE.bind(this));
			if (options.callback) this.streamInfo.callback = options.callback;
		} else {
			if ((!this.streamRequest || !this.streamRequest.running) && !this.eventSource) { //Only one XHRstreaming request is allowed
				this.buffer = '';
				this.request = this.doRequest(queryString, options);

				if (options.callback) this.streamInfo.callback = options.callback;
			} else { //Simple XHR request
				var request = new Request({
					url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/' + this.ape.options.transport + '/?',
					onFailure: this.ape.requestFail.bind(this.ape, [-2, this]),
					onComplete: function(resp) {
						$clear(this.requestFailObserver.shift());
						this.request.dataSent = true;//In the case of XHRStreaming. Request are imediatly close.
						this.ape.parseResponse(resp, options.callback);
					}.bind(this)
				}).send(queryString);
				request.id = $time();
				this.request = request;

				//set up an observer to detect request timeout
				this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [1, request]));

			}

			return this.request;
		}
	},

	doRequest: function(queryString, options) {
		this.streamInfo.forceClose = false;

		var request = new Request.XHRStreaming({
			url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/' + this.ape.options.transport + '/?',
			onProgress: this.readFragment.bindWithEvent(this),
			onFailure: this.ape.requestFail.bind(this.ape, [-2, this]),
			onComplete: function(resp) {
				$clear(this.streamInfo.timeoutObserver);
				if (this.ape.status > 0) {
					if (this.streamInfo.cleanClose) this.ape.check();
					else this.newStream();
					this.streamInfo.cleanClose = false;
				}
			}.bind(this)
		}).send(queryString);
		
		request.id = $time();
		this.streamRequest = request;
		
		//this should no longer exist
		//this.streamInfo.timeoutObserver = (function() {
		//	this.streamInfo.forceClose = true;
		//	//try to imediatly close stream
		//	if (this.checkStream()) this.newStream();
		//}).delay(1000*60, this);

		return request;
	},

	readSSE: function(data) {
		this.ape.parseResponse(data, this.streamInfo.callback);
		this.streamInfo.callback = null;
	},

	readFragment: function(text){
		this.streamInfo.canClose = false;

		if (text == '') {

			this.streamInfo.canClose = true;
			this.streamInfo.cleanClose = true;
			this.ape.parseResponse(text, this.streamInfo.callback);

			this.streamInfo.callback = null;
		} else {
			text = this.buffer + text;
			var group = text.split("\n\n");
			var length = group.length;
			
			// If group.length is gretter than 1 the fragment received complete last RAW or contains more than one RAW
			if (group.length > 1) { 	
				//Clear buffer
				this.buffer = '';
				
				for (var i = 0; i < length-1; i++) { 
					this.ape.parseResponse(group[i], this.streamInfo.callback);
				}

				if (group[length-1] !== '') { //Last group complete last received raw but it's not finish
					this.buffer += group[length-1];
				} else { //Received fragment is complete
					this.streamInfo.canClose = true;
					if (this.checkStream()) this.newStream();
				}

				//Delete callback
				this.streamInfo.callback = null;
			} else {//Fragement received is a part of a raw 
				this.buffer = text; 
			}
		}
	},
	
	running: function() {
		return (this.streamRequest && this.streamRequest.running) ? true : this.eventSource ? true : false;
	},	

	checkStream: function() {
		return (this.streamInfo.forceClose && this.streamInfo.canClose) || (this.streamRequest && this.streamRequest.read >= this.maxRequestSize && this.streamInfo.canClose);
	},

	newStream: function() {
//		this.ape.request.send('CLOSE');//This will close the stream request
		$clear(this.streamInfo.timeoutObserver);
		this.streamRequest.cancel();
		this.ape.check();
	},

	cancel: function(){
		if (this.request) this.request.cancel();

		$clear(this.streamInfo.timeoutObserver);
		$clear(this.requestFailObserver.shift());
	}
});
APE.Transport.XHRStreaming.browserSupport = function() {
	if (Browser.Features.xhr && (Browser.Engine.webkit || Browser.Engine.gecko)) {
		return true;
		/* Not yet 
		if (Browser.Engine.presto && ((typeof window.addEventStream) == 'function')) return true;
		else if (window.XDomainRequest) return true;
		else return Browser.Engine.trident ? 0 : true;
		*/
	} else return 2;//No XHR Support, switch to JSONP
}

