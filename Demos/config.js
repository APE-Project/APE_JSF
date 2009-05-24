var APE_config = {
	'baseUrl': 'http://acheron.local/ape-client/Source', //APE JSF 
	'domain': 'acheron.local', //Your domain, must be the same than the domain in aped.conf of your server
	'server': 'acheron.local' //APE server URL
}

//Scripts to load for APE JSF
APE_config.scripts = [];
['mootools-core', 'Core/Events', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Core/Core', 'Core/Utility'].each(function(script){
	APE_config.scripts.push(APE_config.baseUrl+'/'+script+'.js');
});