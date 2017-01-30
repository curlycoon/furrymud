const http = require("http");
const url = require("url");
const path = require('path');
const fs = require('fs');

const public_html_path = "./http";

module.exports = {
	start: function (port) {
		start_webserver(port);
	},
	server: function() {
		return http_server;
	}
};

var mimeData;

var http_server;
var http_files = [];


function http_handle(request,response) {
	var uri = url.parse(request.url).pathname;
	console.log("URI: " + uri);
	
	if(uri == "/")
		uri = "/index.htm";
	
	if(http_files.indexOf(uri) != -1) {
		fs.readFile(public_html_path + uri, "binary", function(err, file) {
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}

			var mime = mimeData[path.extname(uri)];
			if (mime == null)
				mime = "text/plain";
			
			response.writeHead(200, {"Content-Type": mime });
			response.write(file, "binary");
			response.end();
		});
	}else{
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found\n");
		response.end();
	}
}

function register_public_file(dir,file) {
	
	if(fs.statSync(public_html_path + dir + file).isDirectory()){
		console.log("Registering folder: " + dir + file + '/');
		register_public_folder(dir + file + '/');
	}else{
		console.log("Registering file: " + file);
		http_files.push( dir + file );
	}
}

function register_public_folder(dir){
	
	files = fs.readdirSync(public_html_path + dir);
	
	files.forEach(function(file) {
		register_public_file(dir, file);
	});
}

function start_webserver(port) {
	
	var contents = fs.readFileSync("./settings/mime.json");
	mimeData = JSON.parse(contents);
	
	register_public_folder("/");
	
	http_server = http.createServer(http_handle);
	http_server.listen(3303);
	console.log("Server started.");
}