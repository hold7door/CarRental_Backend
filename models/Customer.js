const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');

const customerSchema = mongoose.Schema({
	name : {type : String},
	phone : {type : String},
	vehicleId : {type : mongoose.Schema.Types.ObjectId, ref : "Vehicle"},
	issueDateTime : {type : Date},
	returnDateTime : {type : Date},
});

module.exports = mongoose.model('Customer', customerSchema);