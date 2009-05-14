var APE_config = {
	'baseUrl': 'http://efyx.fy.to/APE_JSF/ape', //APE JSF 
	'domain': 'fy.to',//Your domain, must be the same than the domain in aped.conf of your server
	'server': 'ape.efyx.fy.to' //APE server URL
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
