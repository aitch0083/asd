var SZ       = require('sequelize');
var _        = require('lodash');
var express  = require('express');
var moment   = require('../../libs/moment');
var config   = require('../../configs/global.config');
var Banner  = require('../../models/banner');
var User     = require('../../models/user');

var Promise = SZ.Promise;
var now     = moment('YYYY-MM-DD HH:mm:ss');
var router  = express.Router();

var front_datatable_columns = [
	'id',
	'description',
	'author',
	'online',
	'is_youtube',
	'start_time',
	'end_time',
	'created',
	'modified'
];

var banner_conditions = {valid: 1};
var user_conditions   = {};

Banner.belongsTo(User, {foreignKey:'creator_id', as:'User'});

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

	if(sort_col === 'author'){
		order = 'User.name ' + sort_dir;
	}

	var offset = (current - 1) * rowCount;

	Promise.join(

		Banner.findAndCountAll({
			where: banner_conditions,
			limit: rowCount,
			offset: offset,
			order: order,
			include: [
				{ model:User, as:'User', required: false, where: user_conditions, attributes:['email', 'id', 'name'] }
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