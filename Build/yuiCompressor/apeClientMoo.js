var APE={Config:{identifier:"ape",init:true,frequency:0,scripts:[]}};APE.Client=new Class({eventProxy:[],fireEvent:function(c,b,a){return this.core.fireEvent(c,b,a)},addEvent:function(d,c,a){var e=c.bind(this),b=this;if(!$defined(this.core)){this.eventProxy.push([d,c,a])}else{b=this.core.addEvent(d,e,a);this.core.$originalEvents[d]=this.core.$originalEvents[d]||[];this.core.$originalEvents[d][c]=e}return b},onRaw:function(c,b,a){return this.addEvent("raw_"+c.toLowerCase(),b,a)},removeEvent:function(b,a){return this.core.removeEvent(b,a)},onCmd:function(c,b,a){return this.addEvent("cmd_"+c.toLowerCase(),b,a)},onError:function(c,b,a){return this.addEvent("error_"+c,b,a)},load:function(a){a=$merge({},APE.Config,a);a.init=function(g){this.core=g;for(var h=0;h<this.eventProxy.length;h++){this.addEvent.apply(this,this.eventProxy[h])}}.bind(this);if(a.transport!=2&&a.domain!="auto"){document.domain=a.domain}if(a.domain=="auto"){document.domain=document.domain}var c=JSON.decode(Cookie.read("APE_Cookie"),{domain:document.domain});if(c){a.frequency=c.frequency.toInt()}else{c={frequency:0}}c.frequency=a.frequency+1;Cookie.write("APE_Cookie",JSON.encode(c),{domain:document.domain});var d=new Element("iframe",{id:"ape_"+a.identifier,styles:{display:"none",position:"absolute",left:-300,top:-300}}).inject(document.body);if(a.transport==2){var f=d.contentDocument;if(!f){f=d.contentWindow.document}f.open();var e="<html><head>";for(var b=0;b<a.scripts.length;b++){e+='<script src="'+a.scripts[b]+'"><\/script>'}e+="</head><body></body></html>";f.write(e);f.close()}else{d.set("src","http://"+a.frequency+"."+a.server+'/?[{"cmd":"script","params":{"domain":"'+document.domain+'","scripts":["'+a.scripts.join('","')+'"]}}]');if(Browser.Engine.gecko){d.contentWindow.location.href=d.get("src")}}d.addEvent("load",function(){if(!d.contentWindow.APE){setTimeout(d.onload,100)}else{d.contentWindow.APE.init(a)}})}});
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
