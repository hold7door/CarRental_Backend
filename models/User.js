const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
	username : {type : String, unique : true},
	salt : {type : String},
	password : {type : String}
});

userSchema.methods.setPassword = function(passwd){
	this.salt = crypto.randomBytes(16).toString('hex');
	this.password = crypto.pbkdf2Sync(passwd, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function(passwd){
	const hash = crypto.pbkdf2Sync(passwd, this.salt, 10000, 512, 'sha512').toString('hex');
	return (hash === this.password);
};

module.exports = mongoose.model("User", userSchema);