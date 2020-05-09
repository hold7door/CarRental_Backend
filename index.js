
// Required Headers
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

//Database Setup for MongoDb Atlas
var db_user = process.env.DB_USER;
var db_pass = process.env.DB_PASS;
console.log(db_user, db_pass);
mongoose.connect(`mongodb+srv://${db_user}:${db_pass}@cluster0-3wux4.mongodb.net/test?retryWrites=true&w=majority`, 
    {useNewUrlParser : true, useUnifiedTopology : true}
);

// app middlewares
const app = express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json('application/json'));


//Controllers
const vehicleController = require('./controllers/vehicleController')(router);
const bookingController = require('./controllers/bookingController')(router);


app.use('/vehicle', vehicleController);
app.use('/booking', bookingController);

// Listen for connections
const port = '4500';
app.listen(port);
console.log(`Server listening on port ${port}`);
