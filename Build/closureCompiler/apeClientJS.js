var a,APE={Config:{identifier:"ape",init:true,frequency:0,scripts:[]},Client:function(b){if(b)this.core=b}};a=APE.Client.prototype;a.eventProxy=[];a.fireEvent=function(b,c,d){this.core.fireEvent(b,c,d)};a.addEvent=function(b,c,d){var e=c.bind(this),f=this;if(this.core==undefined)this.eventProxy.push([b,c,d]);else{f=this.core.addEvent(b,e,d);this.core.$originalEvents[b]=this.core.$originalEvents[b]||[];this.core.$originalEvents[b][c]=e}return f};
a.removeEvent=function(b,c){return this.core.removeEvent(b,c)};a.onRaw=function(b,c,d){this.addEvent("raw_"+b.toLowerCase(),c,d)};a.onCmd=function(b,c,d){this.addEvent("cmd_"+b.toLowerCase(),c,d)};a.onError=function(b,c,d){this.addEvent("error_"+b,c,d)};a.cookie={};a.cookie.write=function(b,c){document.cookie=b+"="+encodeURIComponent(c)+"; domain="+document.domain};
a.cookie.read=function(b){b=b+"=";for(var c=document.cookie.split(";"),d=0;d<c.length;d++){for(var e=c[d];e.charAt(0)==" ";)e=e.substring(1,e.length);if(e.indexOf(b)==0)return decodeURIComponent(e.substring(b.length,e.length))}return null};
a.load=function(b){b=b||{};b.transport=b.transport||APE.Config.transport||0;b.frequency=b.frequency||0;b.domain=b.domain||APE.Config.domain||document.domain;b.scripts=b.scripts||APE.Config.scripts;b.server=b.server||APE.Config.server;b.init=function(g){this.core=g;for(g=0;g<this.eventProxy.length;g++)this.addEvent.apply(this,this.eventProxy[g])}.bind(this);if(b.transport!=2&&b.domain!="auto")document.domain=b.domain;if(b.domain=="auto")document.domain=document.domain;var c=this.cookie.read("APE_Cookie"),
d=eval("("+c+")");if(d)b.frequency=d.frequency+1;else c='{"frequency":0}';d=new RegExp('"frequency":([ 0-9]+)',"g");c=c.replace(d,'"frequency":'+b.frequency);this.cookie.write("APE_Cookie",c);var e=document.createElement("iframe");e.setAttribute("id","ape_"+b.identifier);e.style.display="none";e.style.position="absolute";e.style.left="-300px";e.style.top="-300px";document.body.appendChild(e);if(b.transport==2){c=e.contentDocument;if(!c)c=e.contentWindow.document;c.open();d="<html><head></head>";for(var f=
0;f<b.scripts.length;f++)d+='<script src="'+b.scripts[f]+'"><\/script>';d+="<body></body></html>";c.write(d);c.close()}else{e.setAttribute("src","http://"+b.frequency+"."+b.server+'/?[{"cmd":"script","params":{"domain":"'+document.domain+'","scripts":["'+b.scripts.join('","')+'"]}}]');if(navigator.product=="Gecko")e.contentWindow.location.href=e.getAttribute("src")}e.onload=function(){e.contentWindow.APE?e.contentWindow.APE.init(b):setTimeout(e.onload,100)}};
if(Function.prototype.bind==null)Function.prototype.bind=function(b,c){return this.create({bind:b,arguments:c})};if(Function.prototype.create==null)Function.prototype.create=function(b){var c=this;b=b||{};return function(){var d=b.arguments||arguments;if(d&&!d.length)d=[d];function e(){return c.apply(b.bind||null,d)}return e()}};

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
