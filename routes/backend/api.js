var express = require('express');
var router  = express.Router();

var User = require('../../models/user');

router.get('/', function(req, res, next){
	res.json({
		result: true,
		message: 'API'
	});
	// User.findAndCountAll().then(function(result){
	// 	res.json(result);
	// });
});

module.exports = router;