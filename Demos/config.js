/***
 * APE JSF Setup
 */
/*
APE.Config.baseUrl = 'http://yourdomain.com/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'yourdomain.com'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.yourdomain.com'; //APE server URL
*/

APE.Config.baseUrl = 'http://ape-1.efyx.lya.eu/APE_JSF/'; //APE JSF 
APE.Config.domain = 'efyx.lya.eu'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.efyx.lya.eu:6971'; //APE server URL
//APE.Config.scripts = [APE.Config.baseUrl + '/Build/apeCore.js'];

//Uncomment the following line if you want to load each core file separately
(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/Source/' + arguments[i] + '.js');
})('mootools-core', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Core/Utility');
