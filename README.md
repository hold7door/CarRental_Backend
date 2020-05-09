# CarRental_WhitePanda
API's for a Car Rental Agency 

## Endpoints
### Vehicle model operations. User authentication is required
`/vehicle/add`

    Add new Vehicle
    Method POST
    Required fields - Number, model, capacity, perDayRent and city
`/vehicle/update`

    Update vehicle info if it currently has no active bookings
    Method POST
    Required fields - Number
    Optional fields - newNumber, model, capacity, perDayRent and city
`/vehicle/delete/:vnum`

    Delete Vehicle it it currently has no active bookings
    Method DELETE
    Required fields - vnum in param (Vehicle Number)
`/vehicle/active/:vnum`

    Show Active bookings of Vehicle
    Method GET
    Required param - vnum (Vehicle Number)
`/vehicle/showall`

    Show All vehicles
    METHOD GET

### Customer vehicle booking operations. Authentication not required

`/booking/show`

    Show Vehicles in a city given period
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
  {
    "Number": "UP1313",
    "name": "Arpit Pathak",
    "phone": "9999988888",
    "issueDate": "2020-06-01",
    "issueTime": "09:30",
    "returnDate": "2020-06-02",
    "returnTime": "22:30"
  }
