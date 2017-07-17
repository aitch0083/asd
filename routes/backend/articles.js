var SZ       = require('sequelize');
var _        = require('lodash');
var express  = require('express');
var moment   = require('../../libs/moment');
var config   = require('../../configs/global.config');
var Article  = require('../../models/article');
var User     = require('../../models/user');
var Category = require('../../models/category');

var Promise = SZ.Promise;
var now     = moment.format('YYYY-MM-DD HH:mm:ss');
var router  = express.Router();

var front_datatable_columns = [
	'id',
	'title',
	'category',
	'author',
	'at_top',
	'start_time',
	'created',
	'modified'
];

var article_conditions  = {};
var category_conditions = {};
var user_conditions     = {};

Article.belongsTo(User, {foreignKey:'user_id', as:'User'});
Article.belongsTo(Category, {foreignKey:'category_id', as:'Category'});

router.post('/index', function(req, res, next){

	var signed_user = req.session.user;

	if(!signed_user && !config.debug){
		
		res.json({
			success: false,
			message: "message.login_required"
		});

		return false;
	}

	var current      = parseInt(req.body.current);
	var rowCount     = parseInt(req.body.rowCount);
	var searchPhrase = req.body.searchPhrase;
	var sort_col     = null;
	var sort_dir     = null;

	_.each(front_datatable_columns, function(name){
		var k = 'sort['+name+']';

		if(!_.isUndefined(req.body[k])){
			sort_col = name;
			sort_dir = req.body[k];
			return true;
		}
	});

	var order = '';
	if(sort_col && sort_dir){
		order = sort_col + ' ' + sort_dir;
	} else {
		order = 'id desc';
	}

	if(sort_col === 'category'){
		order = 'Category.title ' + sort_dir;
	}

	if(sort_col === 'author'){
		order = 'User.name ' + sort_dir;
	}

	var offset = (current - 1) * rowCount;

	Promise.join(

		Article.findAndCountAll({
			where: article_conditions,
			limit: rowCount,
			offset: offset,
			order: order,
			include: [
				{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['email', 'id', 'name'] }
			]
		})

	).spread(function(articles){

		console.info('articles:', articles);

		if(!articles || articles === null){

			res.json({
				sort_col: sort_col,
				sort_dir: sort_dir,
				searchPhrase: searchPhrase,
				current: current,
				rowCount: rowCount,
				rows: [],
				total: 0
			});

			return;
		}

		res.json({
			sort_col: sort_col,
			sort_dir: sort_dir,
			searchPhrase: searchPhrase,
			current: current,
			rowCount: rowCount,
			rows: articles.rows,
			total: articles.count
		});
		
		
	}).catch(function(error){
		next(error);
	}); //eo Promise
	
});//eo /login

module.exports = router;