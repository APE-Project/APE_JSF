var APE={Config:{identifier:"ape",init:true,frequency:0,scripts:[]}};
APE.Client=new Class({eventProxy:[],fireEvent:function(a,b,c){return this.core.fireEvent(a,b,c)},addEvent:function(a,b,c){var d=b.bind(this),e=this;if($defined(this.core)){e=this.core.addEvent(a,d,c);this.core.$originalEvents[a]=this.core.$originalEvents[a]||[];this.core.$originalEvents[a][b]=d}else this.eventProxy.push([a,b,c]);return e},onRaw:function(a,b,c){return this.addEvent("raw_"+a.toLowerCase(),b,c)},removeEvent:function(a,b){return this.core.removeEvent(a,b)},onCmd:function(a,b,c){return this.addEvent("cmd_"+
a.toLowerCase(),b,c)},onError:function(a,b,c){return this.addEvent("error_"+a,b,c)},load:function(a){a=$merge({},APE.Config,a);a.init=function(f){this.core=f;for(f=0;f<this.eventProxy.length;f++)this.addEvent.apply(this,this.eventProxy[f])}.bind(this);if(a.transport!=2&&a.domain!="auto")document.domain=a.domain;if(a.domain=="auto")document.domain=document.domain;var b=JSON.decode(Cookie.read("APE_Cookie"),{domain:document.domain});if(b)a.frequency=b.frequency.toInt();else b={frequency:0};b.frequency=
a.frequency+1;Cookie.write("APE_Cookie",JSON.encode(b),{domain:document.domain});var c=(new Element("iframe",{id:"ape_"+a.identifier,styles:{display:"none",position:"absolute",left:-300,top:-300}})).inject(document.body);if(a.transport==2){b=c.contentDocument;if(!b)b=c.contentWindow.document;b.open();for(var d="<html><head>",e=0;e<a.scripts.length;e++)d+='<script src="'+a.scripts[e]+'"><\/script>';d+="</head><body></body></html>";b.write(d);b.close()}else{c.set("src","http://"+a.frequency+"."+a.server+
'/?[{"cmd":"script","params":{"domain":"'+document.domain+'","scripts":["'+a.scripts.join('","')+'"]}}]');if(Browser.Engine.gecko)c.contentWindow.location.href=c.get("src")}c.addEvent("load",function(){c.contentWindow.APE?c.contentWindow.APE.init(a):setTimeout(c.onload,100)})}});

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
