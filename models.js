// Collections
Messages = new Meteor.Collection("messages");

// Rules
Messages.allow({
	insert: function () {
		return true;
	}
});

Meteor.users.allow({
	remove:function() { 
		return true ;
	}
});

// Methods
Meteor.methods({
	openChatroom: function(chatroomKey) {
		check(chatroomKey, String);
	}
});