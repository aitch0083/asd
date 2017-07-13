var express = require('express');
var router  = express.Router();

router.get('/', function(req, res, next){
	res.render('backend/index', {title: 'back'});
});

module.exports = router;