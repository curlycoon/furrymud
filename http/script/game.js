
var socket;
var challange = null;

function unload() {
	socket.disconnect();
}

function add_error_message(data) {
	$("#chatmessages").append($("<div></div>").text(data).addClass("error"));
	$("#chatmessages").animate({scrollTop: $("#chatmessages").get(0).scrollHeight}, 1000);
}

function add_user_message(data) {
	$("#chatmessages").append($("<div></div>").text(data).addClass("echo"));
	$("#chatmessages").animate({scrollTop: $("#chatmessages").get(0).scrollHeight}, 1000);
}

function add_message(data) {
	$("#chatmessages").append($("<div></div>").text(data).addClass("msg"));
	$("#chatmessages").animate({scrollTop: $("#chatmessages").get(0).scrollHeight}, 2000);
}

function reset() {
	$("#chatinput").show();
	$("#passinput").hide();
	challange = null;
	$("#chatmessages").html("");
	$("#chatinput").focus();
}

function main() {
	
	socket = io.connect();

	socket.on('message', function(data){
		console.log(data);
		add_message(data);
	});
	
	socket.on('fatal', function(data){
		add_error_message(data.err);
		$("#chatinput").hide();
		$("#passinput").hide();
		
	});
	
	socket.on("request-password", function(data){
		if(challange == null){
			$("#chatinput").hide();
			$("#passinput").show();
			$("#passinput").focus();
		}else{
			add_error_message(data.err);
		}
		challange = data;
	});
	
	socket.on("clear", function(data){
		reset();
	});

	socket.on('connect', function() {
			
	} );
		
	$('#chatinput').keypress(function(event) {
		if(event.which == 13) {
			event.preventDefault();
			socket.send($('#chatinput').val());
			add_user_message($('#chatinput').val());
			$('#chatinput').val("");
		}
	});
	
	$('#passinput').keypress(function(event) {
		if(event.which == 13) {
			event.preventDefault();
			
			var debug = {
				key: challange.key.toString("hex"),
				username: challange.username,
				password: sha3_512("password")
			};
			
			console.log(debug);
			
			var response = sha3_512(challange.key + "|" + challange.username + "|" + sha3_512($("#passinput").val()));
			socket.send(response);
			$('#passinput').val("");
		}
	});
	
	$("#chatinput").show();
}

$(main);
$(window).on('beforeunload', unload);