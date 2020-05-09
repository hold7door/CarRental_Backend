const mongoose = require('mongoose');
const Customer = require('./Customer');


const vehicleSchema = mongoose.Schema({
    vehicleNumber : {type : String},
    city : {type : String},
    model : {type : String},
    seatingCapacity : {type : Number},
    rentPerDay : {type : Number},
    bookingCustomerList : [{type : mongoose.Schema.Types.ObjectId, ref : "Customer"}]
});

// Check if Vehicle has active bookings
vehicleSchema.methods.checkIfBooked = function(){
	if (this.bookingCustomerList.length === 0)
		return false;
	else return true;
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
