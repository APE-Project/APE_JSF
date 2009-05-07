var APE_Shoutbox = new Class({
	//La classe doit implémenter Ape_client pour intercepter les évènements
	Implements: APEClient,

	//Constructeur de la classe
	initialize: function(core,container){
		//Pour que Ape_client fonctionnement correctement il faut créer une variable de classe _core 
		this._core = core; 

		//Objet destiné a contenir les eléments du dom
		this.els = {};
		//Element dans lequel la shoutbox serra présente
		this.els.container = $(container);

		//Interception de la création d'un nouveau pipe
		this.addEvent('new_pipe',this.createShoutbox);

		//Envoie d'un message
		this.addEvent('cmd_send',this.cmd_send);

		//Réception d'un message
		this.addEvent('raw_data',this.raw_data);

		//Demande du pseudo
		if(!this._core.options.restore){
			var nickname = prompt('Pseudo')
		}else{
			var nickname = null;
		}
		//Appel de la méthode start() du core pour lanncer la connexion
		this._core.start(nickname);
	},
	/***
	 * Créer la shoutbox
	 */
	createShoutbox:function(pipe, options){
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
	cmd_send: function(pipe, sessid, pubid, message){
		this.writeMessage(message, this._core.user.properties.name);
	},

	/***
	 * Intercepte le raw data et écrits le message dans la shoutbox
	 */
	raw_data: function(raw, pipe){
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
