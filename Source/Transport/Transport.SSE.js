/* Notice : This class in only intended to be use as an implemented class */
APE.Request.SSE = new Class({
	SSESupport: ((typeof window.addEventStream) == 'function'), 

	initSSE: function(queryString, options, readCallback) {
		var tmp = document.createElement('div');
		document.body.appendChild(tmp);
		tmp.innerHTML = '<event-source src="http://' + this.ape.options.frequency + '.' + this.ape.options.server + '/?' + queryString + '&' + $time() + '" id="APE_SSE">';
		this.eventSource = document.getElementById('APE_SSE');
		this.eventSource.addEventListener('ape-data', function(ev) { readCallback.run(ev.data) }, false);
	}
});
