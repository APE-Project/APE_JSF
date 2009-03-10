String.implement({
	addSlashes: function(){
		return this.replace(/("|'|\\|\0)/g, '\\$1');
	},
	stripSlashes: function(){
		return this.replace(/\\("|'|\\|\0)/g, '$1');
	}
});
//Override setInterval to be done outside the frame (there is some issue inside the frame)
if (!Browser.Engine.trident && !Browser.Engine.presto){
	setInterval = function(fn,time){
		return window.parent.setInterval(fn,time);
	}
	setTimeout = function(fn,time){
		return window.parent.setTimeout(fn,time);
	}
	clearInterval = function(id){
		return window.parent.clearInterval(id);
	}
}
