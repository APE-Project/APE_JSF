/*
APE.Config.baseUrl = 'http://yourdomain.com/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'yourdomain.com'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.yourdomain.com'; //APE server URL
*/
APE.Config.baseUrl = 'http://efyx.fy.to/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'efyx.fy.to'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.efyx.fy.to'; //APE server URL

//Scripts to load for APE JSF
(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/' + arguments[i] + '.js');
})('mootools-core', 'Core/Core', 'Core/Events', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request.longPolling','Request/Request.SSE', 'Request/Request.XHRStreaming', 'Request/Request.JSONP', 'Core/Utility');
