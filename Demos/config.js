APE.Config.baseUrl = 'http://acheron.local/ape-client/Source'; //APE JSF 
APE.Config.domain = 'acheron.local'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'acheron.local'; //APE server URL

//Scripts to load for APE JSF
['mootools-core', 'Core/Events', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Core/Core', 'Core/Utility'].each(function(script){
	APE.Config.scripts.push(APE.Config.baseUrl + '/' + script + '.js');
});