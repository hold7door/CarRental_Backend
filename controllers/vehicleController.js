const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');

module.exports = (router) => {
	// Add New Vehicle
	router.post('/add', (req, res)=>{
		var newVehicleNumber = req.body.Number;
		var newVehicleModel = req.body.model;
		var newVehicleCapacity = req.body.capacity;
		var newVehicleRent = req.body.perDayRent;
		var newVehicleCity = req.body.city;

		//Check if there is another vehicle with same vehicle Number
		Vehicle.findOne({vehicleNumber : newVehicleNumber}, (err, data)=>{
			if (err) throw err;
			if (!data){
				// Create New Vehicle Object
				var newVehicle = new Vehicle({
					vehicleNumber : newVehicleNumber,
					city : newVehicleCity,
					model : newVehicleModel,
					seatingCapacity : newVehicleCapacity,
					rentPerDay : newVehicleRent,
					bookingCustomerList : new Array()
				});
				newVehicle.save((err, data)=>{
					if (err) throw err;
					res.json({success : true, vehicleNumber : newVehicleNumber});
				});
			}
			else{
				// Duplicate Vehicle Number
				res.json({success : false, message : "Vehicle with given Vehicle Number already exists"});
			}
		});
	});

	// Update vehicle data if it has no active bookings
	router.post('/update', (req, res)=>{

		// Api receives fields to update as key/value pairs in "update" field of req.body
		var toUpdateVehile = req.body.Number;	
		var toUpdateFields = req.body;
		//console.log(toUpdateFields);
		Vehicle.findOne({vehicleNumber : toUpdateVehile}, (err, vdata)=>{
			if (err) throw err;
			if (vdata){
				if (vdata.checkIfBooked() === true)
					res.json({success : false, message : "Vehicle has active bookings. Can't update"});
				else{
					for (let dataItem in toUpdateFields){
						var fkey = dataItem;
						var fval = toUpdateFields[fkey];
						//console.log(fkey, fval);
						if (fkey === 'newNumber')
							vdata.vehicleNumber = fval;
						else if (fkey === 'model')
							vdata.model = fval;
						else if (fkey === 'capacity')
							vdata.seatingCapacity = fval;
						else if (fkey === 'perDayRent')
							vdata.rentPerDay = fval;
						else if (fkey === 'city')
							vdata.city = fval;
					}
					vdata.save((error) => {
						if (error) throw error;
						res.json({success : true, message : "Fields updated successfully"});
					});
				}
			}
			else{
				res.json({success : false, message : "Vehicle with given vehicle number does not exists"});
			}
		});
	});
	//Delete Vehicle if it has no active bookings
	router.delete('/delete/:vnum', (req, res)=>{
		var toDeleteVehicle = req.params.vnum;
		Vehicle.findOne({vehicleNumber : toDeleteVehicle}, (err, vdata)=>{
			if (err) throw err;
			if (vdata){
				if (vdata.checkIfBooked() === true){
					res.json({success : false, message : "Vehicle has active bookings. Can't update"});
				}
				else{
					Vehicle.deleteOne({vehicleNumber : toDeleteVehicle}, (error)=>{
						if (error) throw error;
						res.json({success : true, message : "Vehicle deleted"});
					});
				}
			}
			else{
				res.json({success : false, message : "Vehicle with given vehicle number does not exists"});
			}
		});
	});
	// Show Active Bookings of Vehicle
	router.get('/active/:vnum', (req, res)=>{
		var showDetailVehicle = req.params.vnum;
		Vehicle.findOne({vehicleNumber : showDetailVehicle}).populate('bookingCustomerList').exec((err, vdata)=>{
			if (err) throw err;
			if (vdata){
				res.json({success : true, Number : vdata.vehicleNumber, model : vdata.model, capacity : vdata.seatingCapacity, RentPerDay : vdata.rentPerDay, ActiveBookings : vdata.bookingCustomerList});
			}
			else{
				res.json({success : false, message:"Vehicle Not found"});
			}
		});
	});
	return router;
};












