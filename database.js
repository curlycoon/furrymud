const sqlite3 = require('sqlite3').verbose();

module.exports = {
	connect: function (filename) {
		connect(filename);
	},
	user : function (username, key) {
		return get_user(username, key);
	}
};

var db;

function get_user(username, key) {
	
	"SELECT * FROM USERS WHERE (USERNAME = ? AND PASSWORD = ?)"
	
	return {
		id : 1,
		username : "",
		data : 	null	
	};
}

function save_user(userid, data) {
	
}

function make_user(username, key) {
	
}

function connect(filename){
	db = new sqlite3.Database(filename);
}