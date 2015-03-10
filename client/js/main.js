$(document).ready(function(){

	// Responsive images
	$("img").responsiveImg();
	$(".imageLogo").responsiveImg();

	// Forms validations
	$("input,select,textarea").not("[type=submit]").jqBootstrapValidation();

	// Tooltipe
	$( document ).tooltip({
		hide: {
			delay: 200
      	},
      	position: {
      		my: "center bottom",
        	at: "center top",
      	}
	});

	// Instruction page
	$(".instructionsPage").click(function(e){
		$(this).fadeOut("slow");
	});

	// Google Analitcs
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-42344675-1', 'shhhie.com');
  ga('send', 'pageview');

  	// HostedGraphite
  	var net = require('net');

	var socket = net.createConnection(2003, "carbon.hostedgraphite.com", function() {
	    socket.write("65a47c60-2ba0-4d88-810e-1cde77798b6e.foo 1.2\n");
	    socket.end();
	});

});