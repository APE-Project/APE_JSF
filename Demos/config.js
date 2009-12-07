/***
 * APE JSF Setup
 */
APE.Config.baseUrl = 'http://local.ape-project.org/APE_JSF'; //APE JSF 
APE.Config.domain = 'auto'; 
APE.Config.server = 'ape.local.ape-project.org:6969'; //APE server URL

//APE.Config.baseUrl = 'http://ape-git.dev.weelya.net/APE_JSF'; //APE JSF 
//APE.Config.domain = 'dev.weelya.net'; 
//APE.Config.server = 'ape.ape-git.dev.weelya.net:6970'; //APE server URL

(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/Source/' + arguments[i] + '.js');
})('mootools-core', 'Core/APE', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Core/Utility', 'Core/JSON');
