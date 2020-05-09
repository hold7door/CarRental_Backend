const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');

// Check interval [issueDate, returnDate] can be inserted into the list of non-overlaping intervals of "intervals" sorted by issueDate
function isPossibleInterval(intervals, issueDate, returnDate){
	//console.log(intervals, issueDate, returnDate);
	var lo = 0;
	var hi = intervals.length - 1;
	//true if vehicle has no active bookings
	if (hi < 0)
		return {"possible" : true, "index" : 0};
	var result = hi + 1;
	// Find  First interval whose returnDate is greater than requested issueDate
	while (lo <= hi){
		var mid = Math.floor((lo + hi) / 2);
		//console.log(intervals, mid);
		if ((issueDate.getTime() - intervals[mid].returnDateTime.getTime()) > 0){
			lo = mid + 1;
		} 
		else{
			hi = mid - 1;
			result = mid;
		}
	}
	// Check if [issueDate, returnDate] can exist between intervals[result] and interval[result-1]. A 6hr Cooldown period is required after each journey of vehicle
	var prevDateTime;
	if (result > 0){
		prevDateTime = intervals[result-1].returnDateTime;
	}else{
		prevDateTime = Date.now();
		prevDateTime.setTime(prevDateTime.getTime() + prevDateTime.getTimezoneOffset()*60*1000);
	}
	// 6hr = 6*60*60*1000
	var boundLeft = prevDateTime.getTime() + 21600000;
	if (result === intervals.length){
		boundRight = returnDate.getTime();
	}
	else{
		var boundRight = intervals[result].issueDateTime.getTime() - 21600000;
	}
	//console.log(prevDateTime.getTime(), boundLeft, boundRight);
	//console.log(issueDate.getTime(), returnDate.getTime());
	if ((issueDate.getTime() - boundLeft >= 0) && (boundRight - returnDate.getTime() >= 0))
		return {"possible" : true, "index" : result};
	else
		return {"possible" : false};
}


module.exports = (router) => {
	router.post('/show', (req, res)=>{
		//console.log(req.header('Content-Type'))
		var searchCity = req.body.city;
		var searchFilters = req.body.filters;
		// City is required 
		if (searchCity){
			var filterData = {};
			filterData['city'] = searchCity;
			
			if (searchFilters){
				for (let dataItem in searchFilters){
					var fkey = dataItem;
					var fval = searchFilters[fkey]; 
					if (fkey === 'rentLT')
						filterData['rentPerDay'] = { $lte : fval};
					else if (fkey === 'model')
						filterData['model'] = fval;
					else if (fkey === 'capacity')
						filterData['seatingCapacity'] = fval;
				}
			}
			//console.log(filterData);
			// Issue Date, Issue Time, Return Date and Return Time must be present
			if (searchFilters.issueDate && searchFilters.issueTime && searchFilters.returnDate && searchFilters.returnTime){
				Vehicle.find(filterData).populate('bookingCustomerList').exec((err, vdata)=>{
					if (err) throw err;
					//console.log(vdata);
					var queryResult = [];
					var issueString = searchFilters.issueDate + "T" + searchFilters.issueTime + "+05:30";
					var returnString = searchFilters.returnDate + "T" + searchFilters.returnTime + "+05:30";
					var issueDateOb = new Date(issueString);
					var returnDateOb = new Date(returnString);
					issueDateOb.setTime(issueDateOb.getTime() - issueDateOb.getTimezoneOffset()*60*1000);
					returnDateOb.setTime(returnDateOb.getTime() - returnDateOb.getTimezoneOffset()*60*1000);
					// For every Vehicle in City find those that can fit interval - [issueDate, returnDate]
					for (let vh of vdata){
						//console.log(vh);
						var ifPossible = isPossibleInterval(vh.bookingCustomerList, issueDateOb, returnDateOb);
						//console.log(ifPossible, vh);
						if (ifPossible['possible'] === true){
							queryResult.push({
								VehicleNumber : vh.vehicleNumber,
								Model : vh.model,
								SeatingCapacity : vh.seatingCapacity,
								RentPerDay : vh.rentPerDay,
								City : vh.city
							});
						}
					}
					res.json({successs : true, AllResults : queryResult});
				});
			}
			else{
				res.json({success : false, message : "One/All of the following fields is/are missing - issueDate, issueTime, returnDate, returnTime"});
			}

		}
		else{
			res.json({success : false, message : "City field is required"});
		}
		
	});

	// Book a Vehicle
	router.post('/book', (req, res)=>{
		var vehicleNum = req.body.Number;
		if (vehicleNum){
			// Find Vehicle
			Vehicle.findOne({vehicleNumber : vehicleNum}).populate('bookingCustomerList').exec((err, vdata)=>{
				if (err) throw err;
				if (vdata){
					var issueDate = req.body.issueDate;
					var issueTime = req.body.issueTime;
					var returnDate = req.body.returnDate;
					var returnTime = req.body.returnTime;
					var cName = req.body.name;
					var cPhone = req.body.phone;
					// Required Fields
					if (issueDate && issueTime && returnDate && returnTime && cName && cPhone){
						var issueString = issueDate + "T" + issueTime;
						var returnString = returnDate + "T" + returnTime;
						var issueDateOb = new Date(issueString);
						var returnDateOb = new Date(returnString);
						issueDateOb.setTime(issueDateOb.getTime() - issueDateOb.getTimezoneOffset()*60*1000);
						returnDateOb.setTime(returnDateOb.getTime() - returnDateOb.getTimezoneOffset()*60*1000);
						// Check if Vehicle is available for given period
						var ifPossible = isPossibleInterval(vdata.bookingCustomerList, issueDateOb, returnDateOb);
						if (ifPossible["possible"] === true){
							// Create new Customer
							var newCustomer = new Customer({
								name : cName,
								phone : cPhone,
								vehicleId : vdata._id,
								issueDateTime : issueDateOb,
								returnDateTime : returnDateOb
							});
							newCustomer.save((error, cdata)=>{
								if (error) throw error;
								var atIndex = ifPossible['index'];
								// Add Customer Id to vehicle booking list at index returned to maintain sort order
								vdata.bookingCustomerList.splice(atIndex, 0, cdata._id);
								vdata.save((er)=>{
									if (er) throw er;
									res.json({success : true, Name : cName, Phone : cPhone, vehicleNumber : vdata.vehicleNumber, IssueDate : issueDate, IssueTime : issueTime, ReturnDate : returnDate, ReturnTime : returnTime});
								});
							});
						}
						else{
							res.json({success : false, message : "Vehicle not available for given interval"});
						}
					}
					else{
						res.json({success : false, message : "Fields required - issueDate, issueTime, returnDate, returnTime, Name and Phone Number"});
					}
				}
				else{
					res.json({success : false, message : "Vehicle not found"});
				}
			});
		}
		else{
			res.json({success:false, message:"Field missing - Vehicle Number"});
		}	
	});
	return router;
};