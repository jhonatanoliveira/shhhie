// Subscriptions
Meteor.subscribe("messages");

// Startup
Meteor.startup(function(){
	// Logout user
	if (checkUserLogin()) {
		Session.set("activePage","chatPage");
	} else {
		Session.set("activePage","");
		Session.set("userInChat", false);
	}
});


// Helper functions
Template.pagesController.activePageIs = function(pageName) {
	return Session.equals("activePage",pageName);
}

Template.mainMenu.chatroomKeyToShow = function() {
	return Cookie.get('chatroomKeyToShow');
}

Template.pagesController.flashMessages = function() {
	return Session.get('flashMessages');
}

Template.chat.isUserLogged = function() {
	return checkUserLogin();
}

Template.chat.messages = function() {
	return Messages.find({},{sort: [["created","asc"]]});
}

Template.chat.decrypt = function() {
	var decryptMessage = CryptoJS.AES.decrypt(this.message, Cookie.get("userPassword"));
	decryptMessage = decryptMessage.toString(CryptoJS.enc.Utf8); 
	return decryptMessage;
}

Template.flashMessage.isFlashMessage = function (type) {
	return Session.equals("flashMessageType", type);
}

Template.flashMessage.message = function () {
	return Session.get("flashMessage");
}


// EVENTS HANDLERS

// Pages controller events handler
Template.pagesController.events({
	'click .backMainPage': function(e) {
		if (checkUserLogin()) {
			Session.set("activePage","chatPage");
		} else {
			Session.set("activePage","");
		}
	}
});

// Main menu event handler
Template.mainMenu.events({
	// Create new chatroom
	'click .chatroomKeyToShow': function() {
		// Create username and password
		var username = Random.id();
		var password = Random.id();
		
		// sign in new user
		Accounts.createUser({username: username, password: password},function(error) {
			if (typeof error =='undefined') {
				Cookie.set('chatroomKeyToShow',username+password);
				Cookie.set("userPassword",password);
				Session.set("activePage","chatPage");
				Session.set("userInChat", true);
			} else {
				flashMessage("Internal error creating a Chatroom key. Sorry about that. Please try again.","alertError",error);
			}
		});
	},
	// Select text from input text
	'click .chatroomKeyToShowInput': function() {
		$(".chatroomKeyToShowInput").select();
	},
	// Open new chatroom
	'keypress .openChatroom': function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) {
			openChatroom();
		}
	},
	//Open the chat room clicking
	'click .openChatroomClicking': function(e) {
		openChatroom();
	},
	'click .shhhieHelp': function(e) {
		console.log("shhhieHelp");
		Session.set("activePage","shhhieHelpPage");
	}
});

// Chat event handler
Template.chat.events({
	'keypress .message': function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) {
			e.preventDefault();
			//preparing to send message
			var originalMessage = $(".message").val();
			cryptMessage = CryptoJS.AES.encrypt(originalMessage, Cookie.get("userPassword"));
			Messages.insert({chatroom_key: Meteor.userId(), message: cryptMessage.toString(), created: new Date()}, function(error, result){
				if (typeof error !='undefined') {
					flashMessage("Internal error sending a message. Sorry about that. Please try again.","alertError",error);
				} else {
					$(".message").val("");
				}
			});
		}
	},
	'click .deleteChatroom': function() {
		var decision = confirm("Are you sure???");
		if (decision) {
			// Delete user
			if (Meteor.userId() != null) {
				Meteor.users.remove({_id: Meteor.userId()}, function(error) {
					if (typeof error !='undefined') {
						flashMessage("Internal error deleting the chatroom. Sorry about that. Please try again.","alertError",error);
					} else {
						logoutUser();
					}
				});
			}
		}
	},
	'click .quitChatroom': function() {
		// Logout user
		if (Meteor.userId() != null) {
			logoutUser();
		}
	}
});


// Submenu event handler
Template.subMenu.events({
	'click .sendByFace': function(e) {
		Session.set("activePage","sendByFacePage");
	},
	'click .sendByEmail': function(e) {
		Session.set("activePage","sendByEmailPage");
	}
});

// Footer event handler
Template.footMenu.events({
	'click .shhhieContact': function(e) {
		Session.set("activePage","shhhieContactPage");
	},
	'click .shhhieDonate': function(e) {
		Session.set("activePage","shhhieDonate");
	}
});

// SendByFace events handler
Template.sendByFace.events({

	// Send key by facebook
	'click .sendByFaceButton': function(e) {
		e.preventDefault()

		// prepare to send
		var sendByFaceChatroomKey = $(".sendByFaceChatroomKey").val();
		var emailFaceHtml = ' \
		<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"> \
			<html> \
			<head> \
				<title>Shhhie</title> \
			</head> \
			<body> \
				<a href="http://www.shhhie.com"> \
					<img src="http://www.shhhie.com/img/shhhie_logo_v3_400.png" alt="Shhhie.com" /> \
				</a> \
				<h3 style="color: #2c6877;font-family:"Gill Sans","lucida grande", helvetica, arial, sans-serif;font-size: 165%;">Invite to talk</h3> \
				<p> \
				Somebody invited you for a secret conversation in <a href="http://shhhie.com">Shhhie.com</a>. \
				Please, use the following key to access the chatroom. \
				</p> \
				<p> \
				Chatroom Key: <b>'+ sendByFaceChatroomKey +'</b> \
				</p> \
			</body> \
			</html> \
		';
		var to = $(".sendByFaceUsername").val()+"@facebook.com";
		var from = "facebook@shhhie.com";
		var subject = "You were invited to an anonymous talk";
		Meteor.call('sendEmail',to, from, subject, emailFaceHtml);

		flashMessage("Key sent to Facebook successfully!","alertSuccess");

		// clear fields
		$(".sendByFaceChatroomKey").val("");
		$(".sendByFaceUsername").val("");

	}
});


// SendByEmail events handler
Template.sendByEmail.events({

	// Send key by facebook
	'click .sendByEmailButton': function(e) {
		e.preventDefault()

		// prepare to send
		var sendByEmailChatroomKey = $(".sendByEmailChatroomKey").val();
		var emailEmailHtml = ' \
		<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"> \
			<html> \
			<head> \
				<title>Shhhie</title> \
			</head> \
			<body> \
				<a href="http://www.shhhie.com"> \
					<img src="http://www.shhhie.com/img/shhhie_logo_v3_400.png" alt="Shhhie.com" /> \
				</a> \
				<h3 style="color: #2c6877;font-family:"Gill Sans","lucida grande", helvetica, arial, sans-serif;font-size: 165%;">Invite to talk</h3> \
				<p> \
				Somebody invited you for a secret conversation in <a href="http://shhhie.com">Shhhie.com</a>. \
				Please, use the following key to access the chatroom. \
				</p> \
				<p> \
				Chatroom Key: <b>'+ sendByEmailChatroomKey +'</b> \
				</p> \
			</body> \
			</html> \
		';
		var to = $(".sendByEmailUsername").val()+"<"+$(".sendByEmailEmail").val()+">";
		var from = "contact@shhhie.com";
		var subject = "You were invited to an anonymous talk";
		Meteor.call('sendEmail',to, from, subject, emailEmailHtml);

		flashMessage("Key sent to Email successfully!","alertSuccess");

		// clear fields
		$(".sendByEmailChatroomKey").val("");
		$(".sendByEmailUsername").val("");
		$(".sendByEmailEmail").val("");

	}
});


// ShhhieContact events handler
Template.shhhieContact.events({

	// Send key by facebook
	'click .sendContactButton': function(e) {
		e.preventDefault()

		// prepare to send
		var sendContactMessage = $(".sendContactMessage").val();
		var fromName = $(".sendContactUsername").val();
		var fromEmail =  $(".sendContactEmail").val();
		var from = fromName+"<"+fromEmail+">";
		var to = "contact@shhhie.com";
		var subject = "Contact from Shhhie.com";
		var emailEmailHtml = ' \
		<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"> \
			<html> \
			<head> \
				<title>Shhhie</title> \
			</head> \
			<body> \
				<a href="http://www.shhhie.com"> \
					<img src="http://www.shhhie.com/img/shhhie_logo_v3_400.png" alt="Shhhie.com" /> \
				</a> \
				<h3 style="color: #2c6877;font-family:"Gill Sans","lucida grande", helvetica, arial, sans-serif;font-size: 165%;">Contact</h3> \
				<b>Name: </b>'+ fromName +' \
				<br/> \
				<b>Email: </b>'+ fromEmail +' \
				<br/> \
				<b>Mensagem: </b>'+ sendContactMessage +' \
			</body> \
			</html> \
		';
		Meteor.call('sendEmail',to, from, subject, emailEmailHtml);

		flashMessage("Your contact was sent successfully!","alertSuccess");

		// clear fields
		$(".sendContactMessage").val("");
		$(".sendContactUsername").val("");
		$(".sendContactEmail").val("");

	}
});


// Flash message events handler
Template.flashMessage.events({
	'click .close': function(e) {
		Session.set('flashMessageType',"none");
	}
});


// Donate Page
Template.shhhieDonate.rendered = function() {
	(function(i){var f,s=document.getElementById(i);f=document.createElement('iframe');f.src='//api.flattr.com/button/view/?uid=shhhie&button=compact&url='+encodeURIComponent(document.URL);f.title='Flattr';f.height=20;f.width=110;f.style.borderWidth=0;s.parentNode.insertBefore(f,s);})('flattrbtn');
};



// INTERNAL FUNCTIONS

// Report and shows error in console and for the user.
function flashMessage(message, type, error) {

	if (message == null) {
		message = "Internal error. Sorry about that. Try again, please.";
	}
	if (type == null) {
		type = "alertError";
	}
	if (type == "alertError" || type == "alertInfo") {
		Session.set("activePage","shhhieErrorPage");
	}

	Session.set('flashMessage',message);
	Session.set('flashMessageType',type);
	console.log(message+" => "+error);
}


// Log out user
function logoutUser() {
	Meteor.logout();
	Cookie.clear("userPassword");
	Cookie.clear("chatroomKeyToShow");
	Session.set("userInChat", false);
}


// If user is logged
function checkUserLogin() {
	var isUserLogged = Meteor.userId() != null ? true : false;
	var isUserAlive = Meteor.users.findOne({_id: Meteor.userId()}) != null ? true : false;
	// Send message to everybody in chat, telling about the deletetion
	if (!isUserAlive && Session.equals("userInChat", true) && isUserLogged) {
		flashMessage("Sorry about that... We lost your connection or someone in the chat deleted this chatroom. Could you, please, try to open it again? :)","alertError");
	}
	var keepGoing = isUserLogged && isUserAlive;
	if (!keepGoing) logoutUser();
	return keepGoing;
}

// General open chatroom
function openChatroom() {
	// catch values from input
	var chatroomKey = $(".openChatroom").val();
	var username = chatroomKey.substring(0,17);
	var password = chatroomKey.substring(17,34);
	
	// try login
	Meteor.loginWithPassword(username,password, function(error){
		if (typeof error !='undefined') {
			flashMessage("This chatroom key doesn't exist or it was deleted by someone... :/","alertError",error);
		} else {
			Cookie.set("userPassword",password);
			Cookie.set('chatroomKeyToShow',username+password);
			Session.set("activePage","chatPage");
			Session.set("userInChat", true);
		}
	});
}