var express = require('express');
var router  = express.Router();

var User = require('../../models/user');

router.post('/login', function(req, res, next){

	var username = req.body.username;
	var password = req.body.password;
	var result   = {
		success: false,
		message: "message.login_failed"
	};

	if(!username || !password){
		res.json(result);
	}

	User.findOne({ where: { email: username, password: password, valid: 1 } })
		.then(function(user){
			if(!user){
				result.message = "message.user_invalid";
			} else {
				result.success = true;
				result.message = "message.login_succeeded";

				req.session.user          = user.dataValues;
				req.session.user.password = null;

				result.user = user.dataValues;
			}

			res.json(result);
		});
	// EO User.findOne()
});//eo /login

router.post('/logout', function(req, res, next){

	var user = req.session.user;

	// console.info('/logout, session user:', user);

	req.session.destroy();

	res.json({
		success: true,
		message: "message.logout_succeeded"
	});

});//eo /logout

module.exports = router;