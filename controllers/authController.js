const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = (router) => {
	router.post('/signup', (req, res)=>{
		passport.authenticate('signup', (err, user, info)=>{
			if (err) {throw err};
			if (!user){
				res.json({message : "Duplicate username"});
			}
			else{
				//console.log(user);
				res.json({
					success: true,
					user : user
				});
			}
		})(req, res);
	});

	router.post('/login', (req, res)=>{
		passport.authenticate('login', (err, user)=>{
			req.login(user, {session : false}, (error)=>{
				if (error) {
					res.json({message : "Some error Occured"});
				}
				else{
					const body = {_id : user._id, username : user.username};
					const token = jwt.sign({user : body}, 'secret');
					res.json({token});
				}
			});
		})(req, res);
	});
	return router;
};
