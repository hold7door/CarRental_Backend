
//Cron job to remove completed journeys. Run every 30min

const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const dotenv = require('dotenv');
dotenv.config();
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
//console.log(db_user, db_pass);
mongoose.connect(`mongodb+srv://${db_user}:${db_pass}@cluster0-3wux4.mongodb.net/test?retryWrites=true&w=majority`, 
    {useNewUrlParser : true, useUnifiedTopology : true}
);

let curDateTime = new Date();
curDateTime.setTime(curDateTime.getTime() + 330*60*1000);

function removeCustomer(custId){
	return new Promise(function(resolve, reject){
		Customer.findOneAndDelete({_id : custId}, (err, cdata)=>{
			if (err) reject(err);
			else{
				resolve();
			}
		});
	});
}


Vehicle.find({}).populate('bookingCustomerList').exec((err, vdata)=>{
	for (let vh of vdata){
		let activeBookings = new Array();
		activeBookings = [...vh.bookingCustomerList];
		while(activeBookings.length > 0 && (activeBookings[0].returnDateTime.getTime() < cuDateTime.getTime())){
			removeCustomer(activeBookings[0]._id).then(function(){
				activeBookings.shift();
				vh.bookingCustomerList = activeBookings;
				vh.save();
			}).catch(function(err){
				throw err;
			});
		}
	}
});
