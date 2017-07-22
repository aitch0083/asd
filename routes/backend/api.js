var express  = require('express');
var SZ       = require('sequelize');
var config   = require('../../configs/global.config');
var Article  = require('../../models/article');
var User     = require('../../models/user');
var Category = require('../../models/category');
var Banner   = require('../../models/banner');

var Promise = SZ.Promise;
var router  = express.Router();

//import controllers
var users      = require('./users');
var articles   = require('./articles');
var banners    = require('./banners');
var categories = require('./categories');
var images     = require('./images');

router.use('/users', users);
router.use('/articles', articles);
router.use('/banners', banners);
router.use('/categories', categories);
router.use('/images', images);

router.use('/get_statistics', function(req, res, next){

	var signed_user = req.session.user;

	if(!signed_user && !config.debug){
		
		res.json({
			success: false,
			message: "message.login_required"
		});

		return false;
	}

	Promise.join(

		Article.count({
			where: {valid: 1},
		}),

		Category.count({
			where: {valid: 1},
		}),

		User.count({
			where: {valid: 1},
		}),

		Banner.count({
			where: {valid: 1},
		})

	).spread(function(article_count, category_count, user_count, banner_count){

		res.json({
			success: true,
			article_count: article_count,
			category_count: category_count,
			user_count: user_count,
			banner_count: banner_count
		});
		
		
	}).catch(function(error){
		next(error);
	}); //eo Promise
});

module.exports = router;