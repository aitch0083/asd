var express = require('express');
var router  = express.Router();

//import controllers
var users      = require('./users');
var articles   = require('./articles');
var banners    = require('./banners');
var categories = require('./categories');

router.use('/users', users);
router.use('/articles', articles);
router.use('/banners', banners);
router.use('/categories', categories);

module.exports = router;