var APE_Move = new Class({
	Implements: [APE_Client, Options],

	options: {
		container: document.body
	},

	initialize: function(core,options){
		this.core = core;
		this.setOptions(options);
		this.addEvent('init', this.initPlayground);
		this.addEvent('userJoin', this.createUser);
		this.addEvent('pipeCreate', function(type, pipe, options){
			if(type=='multi') this.pipe = pipe;
		});
		this.onRaw('positions',this.rawPositions);
		this.onRaw('data',this.rawData);
		this.onCmd('send', this.cmdSend);
		this.addEvent('userLeft', this.deleteUser);
		this.onError('004',this.reset);
		if (this.options.name) this.core.start(this.options.name);
	},
	deleteUser: function(user, pipe){
		user.element.dispose();
	},

	cmdSend: function(pipe,sessid,pubid,message){
		this.writeMessage(pipe,message,this.core.user);
	},
	rawData: function(raw,pipe){
		this.writeMessage(pipe,raw.datas.msg,raw.datas.sender);
	},
	rawPositions: function(raw, pipe){
		this.movePoint(raw.datas.sender,raw.datas.sender.properties.x,raw.datas.sender.properties.y);
	},
	parseMessage: function(message){
		return unescape(message);
	},
	writeMessage: function(pipe,message,sender){
		//Define sender
		sender = this.pipe.getUser(sender.pubid);

		//destory old message
		sender.element.getElements('.ape_message_container').destroy();

		//Create message container
		var msg = new Element('div',{'opacity':'0','class':'ape_message_container'});
		var cnt = new Element('div',{'class':'msg_top'}).inject(msg);

		//Add message
		new Element('div',{
					'html':this.parseMessage(message),
					'class':'ape_message'
				}).inject(cnt);
		new Element('div',{'class':'msg_bot'}).inject(cnt);

		//Inject message
		msg.inject(sender.element);

		//Show message
		var fx = msg.morph({'opacity':'1'});

		//Delete old message
		(function(el){
			$(el).morph({'opacity':'0'});
			(function(){
				$(this).dispose();
			}).delay(300,el);
		 }).delay(3000,this,msg);
	},
	createUser: function(user, pipe){
		if(user.properties.x){
			var x = user.properties.x;
			var y = user.properties.y;
		}else{
			var x = 8;
			var y = 8;
		}
		var pos = this.element.getCoordinates();
		x = x.toInt()+pos.left;
		y = y.toInt()+pos.top;
		user.element = new Element('div',{
				'class':'demo_box_container',
				'styles':{
					'left':x+'px',
					'top':y+'px'
				}
			}).inject(this.element,'inside');
		new Element('div',{
				'class':'user',
				'styles':{
					'background-color':'rgb('+this.userColor(user.properties.name)+')'
				}
				}).inject(user.element,'inside');
		new Element('span',{
				'text':user.properties.name
			}).inject(user.element,'inside');
	},
	userColor: function(nickname){
		var color = new Array(0,0,0);
		var i=0;
		while(i<3 && i<nickname.length){
			//Transformation du code ascii du caractère en code couleur
			color[i] = Math.abs(Math.round(((nickname.charCodeAt(i)-97)/26)*200+10));			
			i++;
		}
		return color.join(',');
	},
	sendpos: function(x,y){
		var pos=this.posToRelative(x,y);
		this.core.request('SETPOS',[this.pipe.getPubid(),pos.x,pos.y]);
		this.movePoint(this.core.user,pos.x,pos.y);	
	},
	posToRelative:function(x,y){
		var pos = this.element.getCoordinates();
		x = x-pos.left-36;
		y = y-pos.top-46;
		if(x<0) x = 10;
		if(x>pos.width)  x=pos.width-10;
		if(y<0) y = 10;
		if(y>pos.height) y = pos.height-10;
		return {'x':x,'y':y};
	},
	movePoint:function(user,x,y){
		var user = this.pipe.getUser(user.pubid); 
		var el = user.element;
		var fx = el.retrieve('fx'); 

		if(!fx){
			fx = new Fx.Morph(el,{'duration':300,'fps':100});
			el.store('fx',fx);
		}
		el.retrieve('fx').cancel();

		pos = this.element.getCoordinates();

		x = x.toInt();
		y = y.toInt()
		//Save position in user properties
		user.properties.x = x;
		user.properties.y = y;

		fx.start({'left':pos.left+x,'top':pos.top+y});
	},
	initPlayground: function(){
		this.element = this.options.container;
		this.els = {};
		this.els.move_box = new Element('div',{'class':'move_box'}).inject(this.element);
		this.els.move_box.addEvent('click',function(ev){ 
			this.sendpos(ev.page.x,ev.page.y);
		}.bindWithEvent(this));
		this.els.more = new Element('div',{'id':'more'}).inject(this.element,'inside');

		this.els.sendboxContainer = new Element('div',{'id':'ape_sendbox_container'}).inject(this.els.more);

		this.els.sendBox = new Element('div',{'text':'Say : ','id':'ape_sendbox'}).inject(this.els.sendboxContainer,'bottom');
		this.els.sendbox = new Element('input',{
							'type':'text',
							'id':'sendbox_input',
							'autocomplete':'off',
							'events':{
								'keypress':function(ev){
										if(ev.code == 13){
											var val = this.els.sendbox.get('value');
											if(val!=''){
												this.pipe.send(val);
												$(ev.target).set('value','');
											}
										}
									}.bind(this)
							}
						}).inject(this.els.sendBox);
		this.els.sendButton = new Element('input',{
							'type':'button',
							'id':'sendbox_button',
							'value':'Send',
							'events': {

								'click': function(){
									var val = this.els.sendbox.get('value');
									if(val!=''){
										this.pipe.send(val);
										$(ev.target).set('value','');
									}
								}.bind(this)
							}
						}).inject(this.els.sendBox);
	},
	reset: function(){
		this.core.clearSession();
		if (this.element) {
			this.element.empty();
		}
		this.core.initialize(this.core.options);
	}
});
