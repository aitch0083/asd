var SZ            = require('sequelize');
var _             = require('lodash');
var express       = require('express');
var moment        = require('../../libs/moment');
var config        = require('../../configs/global.config');
var Banner        = require('../../models/banner');
var User          = require('../../models/user');
var BannerDisplay = require('../../models/banner_display');
var path          = require('path');
var fs            = require('fs');
var cheerio       = require('cheerio');

var Promise = SZ.Promise;
var now     = moment().format('YYYY-MM-DD HH:mm:ss');
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

var validator = function(req, res){

	var signed_user = req.session.user;

	if(!signed_user && !config.debug){
		
		return {
			success: false,
			message: "message.login_required"
		};

	} else {
		return {
			user_id: config.debug ? 1 : signed_user.id,
			success: true,
			message: "message.login_required"
		};
	}
};

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

router.get('/new', function(req, res, next){ //create placeholder for new banner
	
	var result = validator(req, res);

	if(result.success){

		let now = moment();

		Banner.create({
			description: 'new banner ('+now.format('YYYY-MM-DD HH:mm')+')',
			valid:       0,
			online:      0,
			start_time:  '',
			end_time:    '',
			creator_id:  result.user_id,
			img1:        '',
			url:         ''
		})
		.then(function(banner){
			
			res.json({
				success: true,
				message: 'Banner created',
				record: banner
			});

		})
		.catch(function(error){
			res.json({
				success: false,
				error: error,
				message: 'Unable to create banner'
			});
		});

	} else {
		res.json(result);
	}
});

router.get('/:id', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var id = req.params.id;

		if(!id){
			throw new Error('Invalid banner ID');
		} 

		Promise.join(

			Banner.findOne({where: {id: id}, valid: 1}),
			BannerDisplay.findAll({
				where: {
					banner_id: id
				}
			})

		).spread(function(banner, related_cates){
			
			if(!banner){
				throw new Error('Invalid banner');
			}

			var result = banner;

			var category_id = [];
			if(related_cates && _.isArray(related_cates)){
				_.each(related_cates, function(rec){
					category_id.push(rec.category_id);
				});
			}

			result.setDataValue('category_id', category_id);

			res.json({
				success: true,
				record: result
			});
		})
		.catch(function(error){
			console.error(error);

			res.json({
				success: false,
				error: error 
			});
		});

	} else {
		res.json(result);
	}
});

router.get('/', function(req, res, next) {

	var result = validator(req, res);

	if(result.success){

		var pageIndex  = parseInt(req.query.pageIndex);
		var pageSize   = parseInt(req.query.pageSize);
		var sortField  = _.trim(_.escape(req.query.sortField));
		var sortOrder  = _.trim(_.escape(req.query.sortOrder));

		var conditions          = { valid: 1 };
		var category_conditions = { valid: 1 };
		var user_conditions     = { valid: 1 };
		var order               = 'id desc';
		var filter              = '';
		
		for(filter in req.query){
			if(_.indexOf(['pageIndex','pageSize', 'sortField', 'sortOrder'], filter) === -1){

				var f_value = _.trim(_.escape(req.query[filter]));

				if(f_value){

					if(filter === 'author'){
						user_conditions['username'] = { '$like': '%' + f_value + '%' }
					} else {
						conditions[filter] = { '$like': '%' + f_value + '%' };
					}
				}
			}
		}

		if(sortField){
			if(sortField === 'author'){
				sortField = '`User`.`username`';
			}
			order = sortField + ' ' + sortOrder;
		}

		pageIndex = !isNaN(pageIndex) ? pageIndex - 1 : 0;
		pageSize  = !isNaN(pageSize) ? pageSize : 20;

		Banner.findAndCountAll({
			where:   conditions,
			order:   order,
			offset:  (pageIndex * pageSize),
			limit:   pageSize,
			attributes:['id', 'description', 'img1', 'url', 'type', 'position', 'start_time', 'end_time', 'created','modified', 'is_youtube'],
			include: [
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id'] }
			]
		}).then(function(result){

			res.json({
				success:    true,
				data:       result.rows,
				itemsCount: result.count
			});

		}).catch(function(error){

			console.error(error);

			res.json({
				success: false,
				error: error 
			});
		});

	} else {
		res.json(result);
	}
});

router.put('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var record = req.body;
		var id     = record.id;

		console.info(req.body);

		Banner.find({where:{id:id}})
		.then(function(banner){

			if(!banner){
				console.info('Unable to find the banner to update with: ', id);

				res.json({
					success: false,
					record: null
				});

				return false;
			}

			record.valid = 1;

			banner.updateAttributes(record).then(function(banner){

				if(_.isArray(record.category_id)){

					var displays = [];

					_.each(record.category_id, function(cate_id){
						displays.push({
							category_id: cate_id,
							banner_id: record.id
						});
					});

					if(displays.length){
						BannerDisplay.destroy({
							where: {
								banner_id: record.id	
							}
						}).then(function(){
							BannerDisplay.bulkCreate(displays);
						});
					}
				}

				res.json({
					success: true,
					record: banner
				});
			})

			.catch(function(error){

				console.info('error @ /banners PUT:', error);

				res.json({
					success: false,
					error: error 
				});
			});

		})
		.catch(function(error){

			console.info('error @ /banners PUT:', error);

			res.json({
				success: false,
				error: error 
			});
		});

	}else {
		res.json(result);
	}
});

router.delete('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var record = req.body;
		var id     = record.id;

		Banner.find({where:{id:id}})
		.then(function(banner){

			banner.updateAttributes({valid:0})
			.then(function(banner){
				res.json(banner);
			})
			.catch(function(error){
				console.info('Error @banner delete:', error);
				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){
			console.info('Error @banner delete:', error);
			res.json({
				success: false,
				error: error 
			});
		});

	}else {
		res.json(result);
	}
});

module.exports = router;