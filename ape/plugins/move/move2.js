function var Ape_message = new Class({
	Extends: Ape_message,
	toElement: function(){
		//Create message container
		$(Ape.buffers.get_current().get('users').get(this.user.get('nickname')).element).getElements('.ape_message_container').destroy();
		this.element = new Element('div',{'opacity':'0','class':'ape_message_container'});
		var cnt = new Element('div',{'class':'msg_top'}).inject(this.element);
		//Add sender to message

		new Element('div',{
					'html':this.message,
					'class':'ape_message'
				}).inject(cnt);
		new Element('div',{'class':'msg_bot'}).inject(cnt);
		$(this.element).inject($(Ape.buffers.get('chan_'+Ape.options.channel).get('users').get(this.user.get('nickname')).element));
		//Delete old message
		var fx = $(this.element).morph({'opacity':'1'});
		(function(el){
			$(el).morph({'opacity':'0'});
			(function(){
				$(this).dispose();
			}).delay(300,el);
		 }).delay(3000,this,this.element);
		 this.element = new Element('div');
		return this.element;
	}
});
var Ape_core = new Class({
	Extends: Ape_core,
	toElement: function(){
		var move_box = window.parent.document.getElementById('ape_master_container');
		this.element = move_box;
		move_box = $(move_box).addEvent('click',function(ev){
			Ape.sendpos(ev.page.x,ev.page.y);
		});
		this.more = new Element('div',{'id':'more'}).inject(window.parent.$('ape_master_container'),'after');

		this.sendbox_container = new Element('div',{'id':'ape_sendbox_container'}).inject(this.more);

		this.send_box = new Element('div',{'text':'Dire : ','id':'ape_sendbox'}).inject(this.sendbox_container,'bottom');
		this.sendbox = new Element('input',{
							'type':'text',
							'id':'sendbox_input',
							'autocomplete':'off',
							'events':{
								'keypress':function(ev){
										if(ev.code == 13){
											var value = $(ev.target).get('value');
											Ape.send(this.buffers.get_current(),value);
											$(ev.target).set('value','');
										}
									}.bind(this)
							}
						}).inject(this.send_box);
		this.send_button = new Element('input',{
							'type':'button',
							'id':'sendbox_button',
							'value':'Envoyer',
							'events': {
								'click': function(){
									Ape.send(this.buffers.get_current(),$(this.sendbox).get('value'));
								}.bind(this)
							}
						}).inject(this.send_box);
	}
});
var Ape_buffer = new Class({
	Extends: Ape_buffer,
	write:function(message,user){
		if(user){
			if($type(message)=='string') message = new Ape_message(message,user);
			message.toElement();
		}
	},
	toElement: function(){
		//draw users list
		this.element = window.parent.$('ape_master_container');
	}
});
var Ape_users = new Class({
	Extends: Ape_users,
	toElement:function(){
		this.element = window.parent.$('ape_master_container');
	}
});
var Ape_user = new Class({
	Extends: Ape_user,
	toElement: function(){
		var box_pos = window.parent.$('ape_master_container').getCoordinates();
		if(this.user.get('properties')){
			var x = this.user.get('properties').x;
			var y = this.user.get('properties').y;
		}else{
			var x = 8;
			var y = 8;
		}
		x = x.toInt()+box_pos.left;
		y = y.toInt()+box_pos.top;

		x = x || box_pos.left;
		y = y || box_pos.top;
		this.element = new Element('div',{
				'class':'demo_box_container',
				'styles':{
					'left':x+'px',
					'top':y+'px',
					'background-color':'rgb('+user_color(this.user.get('nickname'))+')'
				}
			}).inject(window.parent.$('ape_master_container'),'inside');
		new Element('div',{
				'class':'user'
				}).inject(this.element,'inside');
		new Element('span',{
				'text':this.user.get('nickname')
			}).inject(this.element,'inside');
	}
});
var Ape_buffers = new Class({
	Extends:Ape_buffers,
	toElement: function(){
		this.element = window.parent.$('ape_master_container');
	}
});
var Ape_core = new Class({
	Extends: Ape_core,
	pos_to_relative:function(x,y){
		var pos = window.parent.$('ape_master_container').getCoordinates();
		x = x-pos.left-36;
		y = y-pos.top-46;
		if(x<0) x = 10;
		if(x>pos.width)  x=pos.width-10;
		if(y<0) y = 10;
		if(y>pos.height) y = pos.height-10;
		return {'x':x,'y':y};
	},
	/***
	 * Send new position to server
	 */
	sendpos: function(x,y){
		var pos=this.pos_to_relative(x,y);
		this.move_point(this.me,pos.x,pos.y);	
		this.request('SETPOS',[this.get_sessid(),this.options.channel,pos.x,pos.y]);
	},
	/***
	 * Move point from his current position to a new position
	 */
	move_point:function(user,x,y){
		var el = $(this.buffers.get_current().rget('users',user.get('nickname')).element);
		pos = window.parent.$('ape_master_container').getCoordinates();
		x = x.toInt();
		y = y.toInt()
		el.morph({'left':pos.left+x,'top':pos.top+y});
	}
});
function rand_chars(){
	 var keylist="abcdefghijklmnopqrstuvwxyz123456789"
	 var temp=''
	 var plength=5;
	 for (i=0;i<plength;i++){
		 temp+=keylist.charAt(Math.floor(Math.random()*keylist.length))
	}
	return temp;
}
var Ape;
window.addEvent('domready',function(){
	Ape = new Ape_core(window.parent.ape_config);
	Ape.start({'uid':rand_chars()});
	Ape.handle_raw('POSITIONS',function(param){
		this.move_point(param.datas.user,param.datas.user.get('properties').x,param.datas.user.get('properties').y);
	}.bind(Ape));
	Ape.handle_raw('CHANMSG',function(param){
		param.datas.channel.write(param.datas.msg,param.datas.sender);
	}.bind(Ape));
});

