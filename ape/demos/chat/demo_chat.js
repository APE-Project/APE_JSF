var Ape_chat = new Class({
	Implements: [APE_Client, Options],
	options:{
		container: document.body,
		logs_limit:10
	},
	initialize: function(core,options){
		this._core = core;
		this.setOptions(options);
		this.els = {};
		this.currentPipe = null;
		this.logging = true;
		this.addEvent('init', this.createChat);
		this.addEvent('pipeCreate', this.createPipe);
		this.addEvent('userJoin', this.createUser);
		this.addEvent('userLeft', this.deleteUser);
		this.onCmd('send', this.cmdSend);
		this.addEvent('restoreEnd',this.restoreEnd);
		this.onRaw('data', this.rawData);
		this.onError('004',this.reset);
		//If name is not set & it's not a session restore ask user for his nickname
		if(!this.options.name && !this._core.options.restore){
			this.promptName();
		}else{
			this.start();
		}
	},
	promptName: function(){
		this.els.namePrompt = {};
		this.els.namePrompt.div = new Element('form',{'class':'ape_name_prompt','text':'Choose a nickname : '}).inject(this.options.container)
		this.els.namePrompt.div.addEvent('submit',function(ev){
									ev.stop();
									this.options.name = this.els.namePrompt.input.get('value');
									this.els.namePrompt.div.dispose();
									this.start()
								}.bindWithEvent(this));
		this.els.namePrompt.input = new Element('input',{'class':'text'}).inject(this.els.namePrompt.div);
		new Element('input',{'class':'submit','type':'submit','value':'GO!'}).inject(this.els.namePrompt.div)
	},
	start: function(){
		this._core.start(this.options.name);
	},
	setPipeName: function(pipe, options){
		if(options.name){
			pipe.name = options.name;
			return;
		}
		if(options.sender){
			pipe.name = options.sender.properties.name;
		}else{
			pipe.name = options.pipe.properties.name;
		}
	},
	getCurrentPipe: function(){
		return this.currentPipe;
	},
	setCurrentPipe: function(pubid,save){
		save = !save;
		if(this.currentPipe){
			this.currentPipe.els.tab.addClass('unactive');
			this.currentPipe.els.container.addClass('ape_none');
		}
		this.currentPipe = this._core.pipes.get(pubid);
		this.currentPipe.els.tab.removeClass('new_message');
		this.currentPipe.els.tab.removeClass('unactive');
		this.currentPipe.els.container.removeClass('ape_none');
		this.scrollMsg(this.currentPipe);
		if(save) this._core.setSession('currentPipe',this.currentPipe.getPubid());
		return this.currentPipe;
	},
	cmdSend: function(pipe, sessid, pubid, message){
		this.writeMessage(pipe,message,this._core.user);
	},
	rawData: function(raw, pipe){
		this.writeMessage(pipe,raw.datas.msg,raw.datas.sender);
	},
	parseMessage: function(message){
		return unescape(message);
	},
	notify: function(pipe){
		pipe.els.tab.addClass('new_message');
	},
	scrollMsg: function(pipe){
		var scrollSize = pipe.els.message.getScrollSize();
		pipe.els.message.scrollTo(0,scrollSize.y);
	},
	writeMessage: function(pipe, message, sender){
		//Append message to last message
		if(pipe.lastMsg && pipe.lastMsg.sender.properties.name == sender.properties.name){
			var cnt = pipe.lastMsg.el;
		}else{//Create new one
			//Create message container
			var msg = new Element('div',{'class':'ape_message_container'});
			var cnt = new Element('div',{'class':'msg_top'}).inject(msg);
			if(sender){
			       new Element('div',{'class':'ape_user','text':sender.properties.name}).inject(msg,'top');
			}
			new Element('div',{'class':'msg_bot'}).inject(msg);
			msg.inject(pipe.els.message);
		}
		new Element('div',{
			'text':this.parseMessage(message),
			'class':'ape_message'
		}).inject(cnt);
		//Scroll message box
		this.scrollMsg(pipe);
		//Add message to logs
		/*
		if(pipe.logs.length>=this.options.logs_limit){
			pipe.logs.shift();
		}
		pipe.logs.push({'message':message,'sender':sender});
		*/
		pipe.lastMsg = {sender:sender,el:cnt};
		//notify 
		if(this.getCurrentPipe().getPubid()!=pipe.getPubid()){
			this.notify(pipe);
		}
	},
	createUser: function(user, pipe){
		user.el = new Element('div',{
				'class':'ape_user'
			}).inject(pipe.els.users);
		new Element('a',{
				'text':user.properties.name,
				'href':'javascript:void(0)',
				'events': {
				'click':
					function(ev,user){
							if(!this._core.getPipe(user.pubid)){
								user.pipe = {pubid:user.pubid,properties:user.properties};
								var pipe = this._core.newPipe('uni', user);
							}
							this.setCurrentPipe(user.pubid);
						}.bindWithEvent(this,[user])
				}
			}).inject(user.el,'inside');
	},
	deleteUser: function(user, pipe){
		user.el.dispose();
	},
	createPipe: function(type, pipe, options){
		if(type=='uni') this.setPipeName(pipe, options);
		//Define some pipe variables to handle logging and pipe elements
		pipe.els = {};
		pipe.logs = new Array();
		//Container
		pipe.els.container = new Element('div',{
							'class':'ape_pipe ape_none '
						}).inject(this.els.pipeContainer);
		//Message container
		pipe.els.message = new Element('div',{'class':'ape_messages'}).inject(pipe.els.container,'inside');

		var tmp = new Element('div');
		//If pipe has a users list 
		if(pipe.users){
			pipe.els.usersRight = new Element('div',{
				'class':'users_right'
			}).inject(pipe.els.container);

			pipe.els.users = new Element('div',{
			                                 'class':'ape_users_list'
		                                 }).inject(pipe.els.usersRight);;
		}
		//Add tab
		pipe.els.tab = new Element('div',{
			'class':'ape_tab unactive'
		}).inject(this.els.tabs);
		var tmp = new Element('a',{
				'text':pipe.name,
				'href':'javascript:void(0)',
				'events':{
					'click':function(pipe){
							this.setCurrentPipe(pipe.getPubid())
						}.bind(this,[pipe])
					}
				}).inject(pipe.els.tab);
		//Hide other pipe and show this one
		this.setCurrentPipe(pipe.getPubid());
		/* Do not work anymore
		//If logs, lets create it
		if(options.logs && options.logs.length>0){
			var logs = options.logs;
			for(var i = 0; i<logs.length; i++){
				this.writeMessage(pipe,logs[i].message,logs[i].sender);
			}
		}
		*/
	},
	createChat: function(){
		this.els.pipeContainer = new Element('div',{'id':'ape_container'});
		this.els.pipeContainer.inject(this.options.container);

		this.els.more = new Element('div',{'id':'more'}).inject(this.options.container,'after');
		this.els.tabs = new Element('div',{'id':'tabbox_container'}).inject(this.els.more);
		this.els.sendboxContainer = new Element('div',{'id':'ape_sendbox_container'}).inject(this.els.more);

		this.els.sendBox = new Element('div',{'id':'ape_sendbox'}).inject(this.els.sendboxContainer,'bottom');
		this.els.sendboxForm = new Element('form',{
								'events':{
									'submit':function(ev){
											ev.stop();
											var val = this.els.sendbox.get('value');
											if(val!=''){
												this.getCurrentPipe().send(val);
												this.els.sendbox.set('value','');
											}
										}.bindWithEvent(this)
									}
				}).inject(this.els.sendBox);
		this.els.sendbox = new Element('input',{
							'type':'text',
							'id':'sendbox_input',
							'autocomplete':'off'
						}).inject(this.els.sendboxForm);
		this.els.send_button = new Element('input',{
							'type':'button',
							'id':'sendbox_button',
							'value':''
						}).inject(this.els.sendboxForm);
	},
	restoreEnd: function(){
		this._core.getSession('currentPipe',function(resp){
			if(resp.raw=='SESSIONS') this.setCurrentPipe(resp.datas.sessions.currentPipe);
		}.bind(this));
	},
	reset: function(){
		this._core.clearSession();
		if(this.els.pipeContainer){
			this.els.pipeContainer.dispose();
			this.els.more.dispose();
		}
		this._core.initialize(this._core.options);
	}
});
