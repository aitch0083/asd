var express = require('express');
var router  = express.Router();

//import controllers
var users = require('./users');

router.use('/users', users);

module.exports = router;