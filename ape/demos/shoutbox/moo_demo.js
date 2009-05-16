var APE_Shoutbox = new Class({
	//This class must implement APE_Client to intercept events
	Implements: APE_Client,

	//Constructor
	initialize: function(core, container){
		//To work APE_Client need your class to set a core variable with a reference to APE_Core
		this.core = core; 

		this.els = {};
		//Shoutbox container
		this.els.container = $(container);

		//Catch pipeCreate events (when a new pipe is created);
		this.addEvent('pipeCreate',this.createShoutbox);

		//Catch message sending
		this.onCmd('send',this.cmdSend);

		//Catch message reception
		this.onRaw('data',this.rawData);

		//Ask the user for his nickname 
		if(!this.core.options.restore){
			var nickname = prompt('Your nickname')
		}else{
			var nickname = null;
		}
		//Call start method from core to start connection to APE server
		this.core.start(nickname);
	},
	/***
	 * Create the shoutbox
	 */
	createShoutbox:function(type, pipe, options){
		/***
		 * Définition d'une variables de class content l'objet pipe
		 * Il serra utilisez pour envoyer les message
		 */
		this.pipe = pipe;

		//Création de la shoutbox
		this.els.shoutbox = new Element('div', 	{'id': 'shoutbox'}).inject(this.els.container);
		
		//Ajout d'un élement pour contenir les messages reçus
		this.els.shoutbox_msg = new Element('div', {'id': 'shoutbox_msg'}).inject(this.els.shoutbox);

		//Ajout du formulaire d'envoie de message
		this.els.shoutboxForm = new Element('form').inject(this.els.shoutbox);
		this.els.shoutboxInput = new Element('input', {'type': 'text', 'class': 'text'}).inject(this.els.shoutboxForm); //Input pour le texte
		new Element('input', {'class': 'submit','type': 'submit','value': 'Envoyer'}).inject(this.els.shoutboxForm); //Bouton envoyer

		//Lorsque le formulaire est soumis, le message est envoyé 
		this.els.shoutboxForm.addEvent('submit', this.postMessage.bindWithEvent(this));
	},

	/***
	 * Intercepte la commande send et écrits le message dans la shoutbox
	 */
	cmdSend: function(pipe, sessid, pubid, message){
		this.writeMessage(message, this.core.user.properties.name);
	},

	/***
	 * Intercepte le raw data et écrits le message dans la shoutbox
	 */
	rawData: function(raw, pipe){
		this.write_message(raw.datas.msg, raw.datas.sender.properties.name);
	},
	
	/***
	 * Écrit un message dans la shoutbox
	 */
	writeMessage: function(message, senderNickname){
		//Création d'un élement pour contenir le message
		var container = new Element('div',{'class': 'msg_container'}).inject(this.els.shoutbox_msg, 'top');
	
		//Ajout du pseudo
		new Element('span',{
					'class': 'pseudo',
					'text': senderNickname+' : '
				}).inject(container);

		//Ajout du msg
		new Element('span',{
					'class': 'msg',
					'text': unescape(message) //les messages reçu du serveur sont echapé
				}).inject(container);
	
	},
	/***
	 * Envoie un message
	 */
	postMessage: function(ev){
		//Empèche le formulaire d'être soumis
		ev.stop();

		//Récupération du contenu de l'input
		var msg = this.els.shoutboxInput.get('value');

		//Enlève les espaces en début et fin de chaine
		msg = msg.trim();

		//Si le message n'est pas vide, il est envoyé
		if(msg!=''){
			//Envoie du message a l'aide de la méthode send() de l'objet pipe
			this.pipe.send(msg);

			//Effacement de l'input
			this.els.shoutboxInput.set('value', '');
		}
	}
});
