var APE_config = {
	'baseUrl': 'http://acheron.local/ape-client', //APE JSF 
	'domain': 'acheron.local', //Your domain, must be the same than the domain in aped.conf of your server
	'server': 'acheron.local' //APE server URL
}

//Scripts to load for APE JSF
APE_config.scripts = [	
		APE_config.baseUrl+'/mootools-core.js',
		APE_config.baseUrl+'/events.js',
		APE_config.baseUrl+'/pipe.js',
		APE_config.baseUrl+'/pipe_proxy.js',
		APE_config.baseUrl+'/pipe_multi.js',
		APE_config.baseUrl+'/pipe_uni.js',
		APE_config.baseUrl+'/core.js',
		APE_config.baseUrl+'/utils.js',
	]
