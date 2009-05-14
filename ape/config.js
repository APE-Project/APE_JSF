var APE_config = {
	'baseUrl': 'http://yourdomain.com/APE_JSF/ape', //APE JSF 
	'domain': 'yourdomain.com',//Your domain, must be the same than the domain in aped.conf of your server
	'server': 'ape.yourdomain.com' //APE server URL
}

//Scripts to load for APE JSF
APE_config.scripts = [	
		APE_config.baseUrl+'/mootools.js',
		APE_config.baseUrl+'/events.js',
		APE_config.baseUrl+'/pipe.js',
		APE_config.baseUrl+'/pipe_proxy.js',
		APE_config.baseUrl+'/pipe_multi.js',
		APE_config.baseUrl+'/pipe_uni.js',
		APE_config.baseUrl+'/core.js',
		APE_config.baseUrl+'/utils.js',
	]
