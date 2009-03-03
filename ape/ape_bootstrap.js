var ape_config;
function ape_cookie(name,remove) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0){
			return c.substring(nameEQ.length,c.length);
		}
	}
	return null;
}

function ape_bootstrap(config){
	ape_config = config;
	config.init_ape = config.init_ape || true;
	var tmp = eval('('+unescape(ape_cookie('Ape_cookie'))+')');
	config.frequency = config.frequency || 0;
	if(tmp){
		config.frequency = parseInt(tmp.frequency);
	}
	var restore = ape_cookie('Ape_restore')
	if(restore){
		config.frequency = restore;
	}
	document.domain = config.domain;
	var frame = document.createElement('iframe');
	frame.setAttribute('id','ape_frequency');
	frame.style.display = 'none';
	frame.style.position = 'absolute';
	frame.style.left = '-300px';
	frame.style.top = '-300px';
	document.body.appendChild(frame);
	frame.setAttribute('src','http://'+config.frequency+'.'+config.server+'?q&script&'+config.scripts.join('&')+'&ac');
}
