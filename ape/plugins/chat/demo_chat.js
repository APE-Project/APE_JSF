var Ape_chat = new Class({
	Implements: [Ape_client, Options],
	options:{
		container: document.body,
		logs_limit:10
	},
	initialize: function(core,options){
		this._core = core;
		this.setOptions(options);
		this.els = {};
		this.options.container = $(this.options.container);
		this.current_pipe = null;
		this.logging = true;
		this.add_event('initialized', this.create_chat);
		this.add_event('new_pipe', this.create_pipe);
		this.add_event('new_pipe_single', this.set_pipe_name);
		this.add_event('new_user', this.create_user);
		this.add_event('user_left', this.delete_user);
		this.add_event('cmd_send', this.cmd_send);
		this.add_event('end_restore',this.end_restore);
		this.add_event('raw_data', this.raw_data);
		this.add_event('err_004',this.reset);
		//If name is not set & it's not a session restore ask user for his nickname
		if(!this.options.name && !this._core.options.restore){
			this.prompt_name();
		}else{
			this.start();
		}
	},
	prompt_name: function(){
		this.els.name_prompt = {};
		this.els.name_prompt.div = new Element('form',{'class':'ape_name_prompt','text':'Choose a nickname : '}).inject(this.options.container)
		this.els.name_prompt.div.addEvent('submit',function(ev){
									ev.stop();
									this.options.name = this.els.name_prompt.input.get('value');
									this.els.name_prompt.div.dispose();
									this.start()
								}.bindWithEvent(this));
		this.els.name_prompt.input = new Element('input',{'class':'text'}).inject(this.els.name_prompt.div);
		new Element('input',{'class':'submit','type':'submit','value':'GO!'}).inject(this.els.name_prompt.div)
	},
	start: function(){
		this._core.start(this.options.name);
	},
	toggle_logging: function(){
		if(this.logging) this.logging = false;
		else this.logging = true;
	},
	set_pipe_name: function(options, pipe){
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
	get_current_pipe: function(){
		return this.current_pipe;
	},
	set_current_pipe: function(pubid,save){
		save = !save;
		if(this.current_pipe){
			this.current_pipe.els.tab.addClass('unactive');
			this.current_pipe.els.container.addClass('ape_none');
		}
		this.current_pipe = this._core.pipes.get(pubid);
		this.current_pipe.els.tab.removeClass('new_message');
		this.current_pipe.els.tab.removeClass('unactive');
		this.current_pipe.els.container.removeClass('ape_none');
		this.scroll_msg_box(this.current_pipe);
		if(save) this._core.set_session('current_pipe',this.current_pipe.get_pubid());
		return this.current_pipe;
	},
	cmd_send: function(pipe, sessid, pubid, message){
		this.write_message(pipe,message,this._core.user);
	},
	raw_data: function(raw, pipe){
		this.write_message(pipe,raw.datas.msg,raw.datas.sender);
	},
	parse_message: function(message){
		return unescape(message);
	},
	notify: function(pipe){
		pipe.els.tab.addClass('new_message');
	},
	scroll_msg_box: function(pipe){
		var scrollSize = pipe.els.message.getScrollSize();
		pipe.els.message.scrollTo(0,scrollSize.y);
	},
	write_message: function(pipe, message, sender){
		//Append message to last message
		if(pipe.last_msg && pipe.last_msg.sender.properties.name == sender.properties.name){
			var cnt = pipe.last_msg.el;
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
			'text':this.parse_message(message),
			'class':'ape_message'
		}).inject(cnt);
		//Scroll message box
		this.scroll_msg_box(pipe);
		//Add message to logs
		if(pipe.logs.length>=this.options.logs_limit){
			pipe.logs.shift();
		}
		pipe.logs.push({'message':message,'sender':sender});
		pipe.last_msg = {sender:sender,el:cnt};
		//notify 
		if(this.get_current_pipe().get_pubid()!=pipe.get_pubid()){
			this.notify(pipe);
		}
	},
	create_user: function(user, pipe){
		user.el = new Element('div',{
			'class':'ape_user'
			}).inject(pipe.els.users);
		new Element('a',{
				'text':user.properties.name,
				'href':'javascript:void(0)',
				'events': {
				'click':
					function(ev,user){
							if(!this._core.get_pipe(user.pubid)){
								user.pipe = {pubid:user.pubid,properties:user.properties};
								var pipe = this._core.new_pipe_single(user);
							}
							this.set_current_pipe(user.pubid);
						}.bindWithEvent(this,[user])
				}
			}).inject(user.el,'inside');
	},
	delete_user: function(user, pipe){
		user.el.dispose();
	},
	create_pipe: function(options, pipe){
		//Define some pipe variables to handle logging and pipe elements
		pipe.els = {};
		pipe.logs = new Array();
		//Container
		pipe.els.container = new Element('div',{
							'class':'ape_pipe ape_none '
						}).inject(this.els.pipe_container);
		//Message container
		pipe.els.message = new Element('div',{'class':'ape_messages'}).inject(pipe.els.container,'inside');

		var tmp = new Element('div');
		//If pipe has a users list 
		if(pipe.users){
			pipe.els.users_right = new Element('div',{
				'class':'users_right'
			}).inject(pipe.els.container);

			pipe.els.users = new Element('div',{
			                                 'class':'ape_users_list'
		                                 }).inject(pipe.els.users_right);;
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
							this.set_current_pipe(pipe.get_pubid())
						}.bind(this,[pipe])
					}
				}).inject(pipe.els.tab);
		//Hide other pipe and show this one
		this.set_current_pipe(pipe.get_pubid());
		/* Do not work anymore
		//If logs, lets create it
		if(options.logs && options.logs.length>0){
			var logs = options.logs;
			for(var i = 0; i<logs.length; i++){
				this.write_message(pipe,logs[i].message,logs[i].sender);
			}
		}
		*/
	},
	create_chat: function(){
		this.els.pipe_container = new Element('div',{'id':'ape_container'});
		this.els.pipe_container.inject(this.options.container);

		this.els.more = new Element('div',{'id':'more'}).inject(this.options.container,'after');
		this.els.tabs = new Element('div',{'id':'tabbox_container'}).inject(this.els.more);
		this.els.sendbox_container = new Element('div',{'id':'ape_sendbox_container'}).inject(this.els.more);

		this.els.send_box = new Element('div',{'id':'ape_sendbox'}).inject(this.els.sendbox_container,'bottom');
		this.els.sendbox_form = new Element('form',{
								'events':{
									'submit':function(ev){
											ev.stop();
											var val = this.els.sendbox.get('value');
											if(val!=''){
												this.get_current_pipe().send(val);
												this.els.sendbox.set('value','');
											}
										}.bindWithEvent(this)
									}
				}).inject(this.els.send_box);
		this.els.sendbox = new Element('input',{
							'type':'text',
							'id':'sendbox_input',
							'autocomplete':'off'
						}).inject(this.els.sendbox_form);
		this.els.send_button = new Element('input',{
							'type':'button',
							'id':'sendbox_button',
							'value':''
						}).inject(this.els.sendbox_form);
	},
	end_restore: function(){
		this._core.get_session('current_pipe',function(resp){
			if(resp.raw=='SESSIONS') this.set_current_pipe(resp.datas.sessions.current_pipe);
		}.bind(this));
	},
	reset: function(){
		this._core.clear_session();
		if(this.els.pipe_container){
			this.els.pipe_container.dispose();
			this.els.more.dispose();
		}
		this._core.initialize(this._core.options);
	}
});
