//Startup
Meteor.startup(function () {
  process.env.MAIL_URL = 'smtp://postmaster%40shhhie.mailgun.org:14yo4l2hxjh0@smtp.mailgun.org:587';
});

// Publish
Meteor.publish("messages", function(){
	return Messages.find({chatroom_key: this.userId}, {fields: {message: 1, chatroom_key: 1, created:1}, limit: 10, sort:[["created","desc"]]});
});

// METHODS
Meteor.methods({

	// Send emails
	'sendEmail': function (to, from, subject, html) {
		if (Meteor.isServer) {
			check([to, from, subject, html], [String]);

			// Let other method calls from the same client start running,
			// without waiting for the email sending to complete.
			this.unblock();

			Email.send({
				to: to,
				from: from,
				subject: subject,
				html: html
				});
		}
	}
});