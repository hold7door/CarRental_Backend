const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const User = require('../models/User');

passport.use('signup', new localStrategy(
	 async function(username, password, done){
			const user = new User({
				username : username
			});
			await user.setPassword(password);
			user.save(function(err, data){
				//console.log('here');
				if (err){ 
					return done(null, false, {message:"Duplicate User"});
				}
				else{
					return done(null, data);
				}	
			});
	}
));

passport.use('login', new localStrategy(
	function(username, password, done){
		User.findOne({username : username}, (err, user)=>{
			if (err) return done(err);
			if (!user){
				return done(null, false, {message : 'User not found'});
			}
			if (!user.validatePassword(password)){
				return done(null, false, {message : 'Incorrect password'});
			}
			return done(null, user, {messages : 'Login Successful'});
		});
	}
));

passport.use(new JWTstrategy({
	secretOrKey : 'secret',
	jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
}, (token, done) =>{
	try{
		return done(null, token.user);
	}
	catch(err){
		return done(err);
	}
}));

