var APE={Config:{identifier:"ape",init:true,frequency:0,scripts:[]}};APE.Client=new Class({eventProxy:[],fireEvent:function(c,b,a){return this.core.fireEvent(c,b,a)},addEvent:function(d,c,a){var e=c.bind(this),b=this;if(!$defined(this.core)){this.eventProxy.push([d,c,a])}else{b=this.core.addEvent(d,e,a);this.core.$originalEvents[d]=this.core.$originalEvents[d]||[];this.core.$originalEvents[d][c]=e;delete this.core.$originalEvents[d][c]}return b},onRaw:function(c,b,a){return this.addEvent("raw_"+c,b,a)},removeEvent:function(b,a){this.core.removeEvent(b,this.core.$originalEvents[b][a])},onCmd:function(c,b,a){return this.addEvent("cmd_"+c,b,a)},onError:function(c,b,a){return this.addEvent("error_"+c,b,a)},load:function(a){var c=JSON.decode(Cookie.read("APE_Cookie"));a=$merge({},APE.Config,a);a.init=function(f){this.core=f;for(var g=0;g<this.eventProxy.length;g++){this.addEvent.apply(this,this.eventProxy[g])}}.bind(this);if(c){a.frequency=c.frequency.toInt()}else{c={frequency:0}}c.frequency=a.frequency+1;Cookie.write("APE_Cookie",JSON.encode(c));APE.Config[a.identifier]=a;var d=new Element("iframe",{id:"ape_"+a.identifier,styles:{display:"none",position:"absolute",left:-300,top:-300}}).inject(document.body);if(a.transport==2){d.contentDocument.open();var e="<html><head></head>";for(var b=0;b<a.scripts.length;b++){e+='<script src="'+a.scripts[b]+'"><\/script>'}e+="<body></body></html>";d.contentDocument.write(e);d.contentDocument.close()}else{document.domain=a.domain;d.set("src","http://"+a.frequency+"."+a.server+'/?[{"cmd":"script","params":{"scripts":["'+a.scripts.join('","')+'"]}}]');d.contentWindow.location.href=d.get("src")}return this}});
/***
 * APE JSF Setup
 */
/*
APE.Config.baseUrl = 'http://yourdomain.com/APE_JSF/Source'; //APE JSF 
APE.Config.domain = 'yourdomain.com'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.yourdomain.com'; //APE server URL
*/
APE.Config.baseUrl = 'http://ape-git.dev.weelya.net/APE_JSF/'; //APE JSF 
APE.Config.domain = 'dev.weelya.net'; //Your domain, must be the same than the domain in aped.conf of your server
APE.Config.server = 'ape.ape-project.dev.weelya.net:6971'; //APE server URL
//APE.Config.scripts = [APE.Config.baseUrl + '/Build/apeCore.js'];

//Uncomment the following line if you want to load each core file separately
(function(){
	for (var i = 0; i < arguments.length; i++)
		APE.Config.scripts.push(APE.Config.baseUrl + '/Source/' + arguments[i] + '.js');
})('mootools-core', 'Core/Events', 'Core/Core', 'Pipe/Pipe', 'Pipe/PipeProxy', 'Pipe/PipeMulti', 'Pipe/PipeSingle', 'Request/Request','Request/Request.Stack', 'Request/Request.CycledStack', 'Transport/Transport.longPolling','Transport/Transport.SSE', 'Transport/Transport.XHRStreaming', 'Transport/Transport.JSONP', 'Core/Utility');
