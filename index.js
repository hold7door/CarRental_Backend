
// Required Headers
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
//Database Setup for MongoDb Atlas
var db_user = process.env.DB_USER;
var db_pass = process.env.DB_PASS;
//console.log(db_user, db_pass);
mongoose.connect(`mongodb+srv://${db_user}:${db_pass}@cluster0-3wux4.mongodb.net/test?retryWrites=true&w=majority`, 
    {useNewUrlParser : true, useUnifiedTopology : true}
);


require('./config/passport');
// app middlewares
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json('application/json'));


//Controllers
const authController = require('./controllers/authController')(router);
const vehicleController = require('./controllers/vehicleController')(router);
const bookingController = require('./controllers/bookingController')(router);

app.use('/', authController);
app.use('/vehicle',passport.authenticate('jwt', { session : false }), vehicleController);
app.use('/booking', bookingController);

// Listen for connections
const port = '4500';
app.listen(port);
console.log(`Server listening on port ${port}`);
