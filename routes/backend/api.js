var express = require('express');
var router  = express.Router();

//import controllers
var users = require('./users');
var articles = require('./articles');

router.use('/users', users);
router.use('/articles', articles);

module.exports = router;