/***
 * APE JSF Setup
 */
/*
APE.Config.baseUrl = 'http://yourdomain.com/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'yourdomain.com'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.yourdomain.com'; //APE server URL
*/
APE.Config.baseUrl = 'http://ape-git.dev.weelya.net/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'weelya.net'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'push2.ape-project.dev.weelya.net'; //APE server URL

//Scripts to load for APE JSF
(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/' + arguments[i] + '.js');
})('mootools-core', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Core/Utility');
/***
 * End of APE JSF setup
 */
