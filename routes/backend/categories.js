var SZ       = require('sequelize');
var _        = require('lodash');
var express  = require('express');
var moment   = require('../../libs/moment');
var config   = require('../../configs/global.config');
var User     = require('../../models/user');
var Category = require('../../models/category');

var Promise = SZ.Promise;
var now     = moment('YYYY-MM-DD HH:mm:ss');
var router  = express.Router();

var front_datatable_columns = [
	'id',
	'title',
	'category',
	'author',
	'level',
	'created',
	'modified'
];

var article_conditions  = {};
var category_conditions = {valid: 1};
var user_conditions     = {};

Category.belongsTo(User, {foreignKey:'user_id', as:'User'});
Category.belongsTo(Category, {foreignKey:'parent_id', as:'Parent'});

router.get('/get_list', function(req, res, next){
	var query = req.query.q;
	var cid   = req.query.id;
	
	var result = {
		incomplete_results: false,
		total_count: 0,
		items: []
	};

	var signed_user = req.session.user;

	if(!signed_user && !config.debug){
		
		res.json(result);

		return false;
	}

	if(cid){
		Category.findOne({where: {id: cid}}).then(function(record){
			
			if(record){
				res.json(record);
			} else {
				res.json({
					id: null,
					name: null,
					text: null
				});
			}
		});

		return false;
	}
	
	Category.findAndCountAll({ where: { valid: 1 } })
			.then(function(results){
				if(!results){
					res.json(result);
				} else {
					result['incomplete_results'] = true;
					result['total_count'] = results.count;
					result['items'] = results.rows;

					res.json(result);
				}
			});	

});

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

	if(sort_col === 'parent'){
		order = 'Parent.title ' + sort_dir;
	}

	if(sort_col === 'author'){
		order = 'User.name ' + sort_dir;
	}

	var offset = (current - 1) * rowCount;

	Promise.join(

		Category.findAndCountAll({
			where: category_conditions,
			limit: rowCount,
			offset: offset,
			order: order,
			include: [
				{ model:Category, as:'Parent', required: false, where: category_conditions, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['email', 'id', 'name'] }
			]
		})

	).spread(function(results){

		if(!results || results === null){

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
			rows: results.rows,
			total: results.count
		});
		
		
	}).catch(function(error){
		next(error);
	}); //eo Promise
	
});//eo /index

module.exports = router;