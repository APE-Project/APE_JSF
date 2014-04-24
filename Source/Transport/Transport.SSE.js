/**
 * SSE Transport abstract class
 * <p> Notice : This class in only intended to be use as an implemented class </p>
 *
 * @name APE.Request.SSE
 * @class
 * @private
 */

/**
 * @name APE.Transport.SSE
 * @borrows APE.Request.SSE.prototype
 * @private
 */
APE.Request.SSE = new Class({
	/* Notice : This class in only intended to be use as an implemented class */
	SSESupport: ((typeof window.addEventStream) == 'function'),
	initSSE: function(queryString, options, readCallback) {
		var tmp = document.createElement('div');
		document.body.appendChild(tmp);
		tmp.innerHTML = '<event-source src="' + this.ape.serverUri + queryString + '&' + $time() + '" id="APE_SSE">';
		this.eventSource = document.getElementById('APE_SSE');
		this.eventSource.addEventListener('ape-data', function(ev) { readCallback.run(ev.data) }, false);
	}
});
