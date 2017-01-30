const io = require('socket.io');
const fs = require('fs');
const crypto = require('crypto');

var connected_users = 0;
var global_messages;

function user_message(socket, msg, userdata) {
	socket.broadcast.emit("message",userdata.name + ": " + msg);
	
	// Game stuff is gonna happen
}

function login_pass(socket, msg, challange) {

	var result = require('js-sha3').sha3_512(challange.key + "|" + challange.username + "|" + require('js-sha3').sha3_512("password"));

	if(msg == result){
		socket.emit("clear");
		socket.removeAllListeners("message");
		console.log("User " + challange.username + " online.");
		var userdata = {
			name : challange.username
		};
		socket.on("message", function(msg) { user_message(socket, msg, userdata); });
	} else {
		challange.err = global_messages.wrong_password;
		challange.tries++;
		challange.key = crypto.randomBytes(256).toString("hex");
		socket.emit("request-password", challange);
	}
	
	if(challange.tries > 10){
		socket.removeAllListeners("message");
		console.log("Too many failed attempts for user " + challange.username + " (" + socket.request.connection.remoteAddress + ")");
		socket.emit("fatal", {err : global_messages.too_many_wrong_passwords});
		socket.disconnect();
	}
}

function login_name(socket,msg) {
	
	if(msg.length == 0 || msg.replace(" ", "").length == 0) {
		socket.emit("message", global_messages.name_empty);
		return;
	}
	
	if(msg.length > 70){
		socket.emit("message", global_messages.name_too_long);
		return;
	}
	
	console.log("Authenticating user: " + msg);
	var challange = {
		key : crypto.randomBytes(256).toString("hex"),
		username: msg,
		tries: 0,
		err: ""
	};
	socket.emit("request-password", challange);
	socket.removeAllListeners("message");
	socket.emit("message", global_messages.password_prompt);
	socket.on("message", function(msg) { login_pass(socket, msg, challange); });
}

function io_connection(socket) {
	
	connected_users++;
	console.log(connected_users + " user(s) online.");
	
	socket.emit("clear");
	
	var username; // Username loaded from db
	var data; //JSON data loaded from db
	
	socket.emit('message', global_messages.name_prompt);
	
	socket.on('message', function(msg) {login_name(socket, msg);});
	socket.on('disconnect', function () {
		connected_users--;
		console.log(connected_users + " user(s) online.");
	});
}

function start_io_server(webserver) {
	var ioServer = io.listen(webserver);
	ioServer.on('connection', io_connection);
}

function main() {
	var contents = fs.readFileSync("./world/en/global.json");
	global_messages = JSON.parse(contents);
	
	var database = require("./database.js");
	database.connect("data.db");
	
	var webserver = require('./web_server');
	webserver.start(3033);
	start_io_server(webserver.server());
}

main();