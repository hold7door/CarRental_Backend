# CarRental_WhitePanda
API's for a Car Rental Agency

PostMan Collection - https://www.getpostman.com/collections/8dd6e065bda5924c7780

EC2 Ip - ec2-3-130-78-21.us-east-2.compute.amazonaws.com:4500

## Endpoints
#### Authentication
`/signup`
	
	Method - POST
	Create account
	Required fields - username, password
`/login`
	
	Method - POST
	Login and receive auth token
	Required fields - username, password
	

#### Vehicle model operations. User authentication is required
`/vehicle/add?secret_token=`

    Add new Vehicle
    Method POST
    Required fields - Number, model, capacity, perDayRent and city
`/vehicle/update?secret_token=`

    Update vehicle info if it currently has no active bookings
    Method POST
    Required fields - Number
    Optional fields - newNumber, model, capacity, perDayRent and city
`/vehicle/delete/:vnum?secret_token=`

    Delete Vehicle it it currently has no active bookings
    Method DELETE
    Required fields - vnum in param (Vehicle Number)
`/vehicle/active/:vnum?secret_token=`

    Show Active bookings of Vehicle
    Method GET
    Required param - vnum (Vehicle Number)
`/vehicle/showall?secret_token=`

    Show All vehicles
    METHOD GET

#### Customer vehicle booking operations. Authentication not required

*A vehicle can not be booked until 6hrs after completing its previous journey*

`/booking/show`

    Show Vehicles in a city available for a given period
    Method POST
    Required fields - city, issueDate, issueTime, returnDate, returnTime
    Option fields - rentLT (rent less than), model, capacity
    Example - 
    {
	    "city" : "Gurugram",
      "filters" : {
        "capacity" : "6",
        "rentLT" : "1000",
        "issueDate" : "2020-06-01",
        "issueTime" : "09:30",
        "returnDate" : "2020-06-02",
        "returnTime" : "22:30"
        }
    }
`/booking/book`

	Book a vehicle
	Method POST
	All fields required
	{
	"Number": "UP1313",
	"name": "Arpit Pathak",
	"phone": "9999988888",
	"issueDate": "2020-06-01",
	"issueTime": "09:30",
	"returnDate": "2020-06-02",
	"returnTime": "22:30"
	}

*Note - Completed journeys can be removed by running cron-job/removeFinished.js as cron job every 30min*
