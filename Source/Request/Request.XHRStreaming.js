Request.XHRStreaming = new Class({

	Extends: Request,

	lastTextLength: 0,
	read: 0, //Contain the amout of data read

	onStateChange: function(){
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

APE.Request.XHRStreaming = new Class({
	
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

	send: function(queryString, options, args) {
		if (this.SSESupport && !this.eventSource) {
			console.log('New SSE ', queryString);
			this.initSSE(queryString, options, this.readSSE.bind(this));
			if (options.callback) this.streamInfo.callback = options.callback;
		} else {
			if ((!this.streamRequest || !this.streamRequest.running) && !this.eventSource) { //Only one XHRstreaming request is allowed
				this.buffer = '';
				this.request = this.doRequest(queryString, options, args);

				if (options.callback) this.streamInfo.callback = options.callback;
				console.log('[STREAM] id : ', this.request.id);
			} else { //Simple XHR request
				var request = new Request({
					url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/?',
					onFailure: this.ape.requestFail.bind(this.ape, [args, -2, this]),
					onComplete: function(resp) {
						$clear(this.requestFailObserver.shift());
						this.request.dataSent = true;//In the case of XHRStreaming. Request are imediatly close.
						this.ape.parseResponse(resp, options.callback);
					}.bind(this)
				}).send(queryString + '&' + $time());
				request.id = $time();
				this.request = request;

				//set up an observer to detect request timeout
				this.requestFailObserver.push(this.ape.requestFail.delay(this.ape.options.pollTime + 10000, this.ape, [arguments, -1, request]));

				console.log('[REQUEST] id : ', request.id);
			}

			return this.request;
		}
	},

	doRequest: function(queryString, options, args) {
		this.streamInfo.forceClose = false;

		var request = new Request.XHRStreaming({
			url: 'http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/?',
			onProgress: this.readFragment.bindWithEvent(this),
			onFailure: this.ape.requestFail.bind(this.ape, [args, -2, this]),
			onComplete: function(resp) {
				$clear(this.streamInfo.timeoutObserver);
				if (this.ape.status > 0) {
					if (this.streamInfo.cleanClose) {
						console.log('clean close');
						this.ape.check();
					} else {
						console.log('ugly close');
						this.newStream();
					}
					this.streamInfo.cleanClose = false;
				}
			}.bind(this)
		}).send(queryString + '&' + $time());
		
		request.id = $time();
		this.streamRequest = request;
		
		//Request can't exced 3min
		this.streamInfo.timeoutObserver = (function() {
			console.info('timeout exced');
			this.streamInfo.forceClose = true;
			//try to imediatly close stream
			if (this.checkStream()) {
				console.log('new stream timeout exced');
				this.newStream();
			}
		}).delay(1000*60, this);

		return request;
	},

	readSSE: function(data) {
		this.ape.parseResponse(data, this.streamInfo.callback);
		this.streamInfo.callback = null;
	},

	readFragment: function(text){
		this.streamInfo.canClose = false;

		if (text == 'CLOSE') {

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
				
				if (group[length-1] !== '') { //Last group complete last received raw but it's not finish
					this.buffer += group[length-1];
				} else { //Received fragment is complete
					this.streamInfo.canClose = true;
					if (this.checkStream()) this.newStream();
				}


				for (var i = 0; i < length-1; i++) { 
					console.info(group[i], this.id);
					this.ape.parseResponse(group[i], this.streamInfo.callback);
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
		this.ape.request('CLOSE');//This will close the stream request
	},

	cancel: function(){
		console.log('cancel');
		$clear(this.streamInfo.timeoutObserver);
		$clear(this.requestFailObserver.shift());
		this.request.cancel();
	},
	stopWindow: function() {
//		return Browser.Engine.webkit;
//		return false;
	}
});

APE.Request.XHRStreaming.browserSupport = function() {
	if (Browser.Features.xhr) {
		if (Browser.Engine.presto && ((typeof window.addEventStream) == 'function')) return true;
		else return Browser.Engine.trident ? 0 : true;
	} else return 2;//No XHR Support, switch to JSONP
}
