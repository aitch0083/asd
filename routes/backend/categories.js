var SZ       = require('sequelize');
var _        = require('lodash');
var express  = require('express');
var moment   = require('../../libs/moment');
var config   = require('../../configs/global.config');
var User     = require('../../models/user');
var Category = require('../../models/category');

var Promise = SZ.Promise;
var now     = moment().format('YYYY-MM-DD HH:mm:ss');
var router  = express.Router();

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

router.post('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var record    = req.body;
		var title     = _.trim(_.escape(record.title));
		var desc      = _.trim(_.escape(record.description));
		var id        = record.id;
		var level     = record.level;
		var parent_id = record.parent_id;
		var url       = record.url;
		var user_id   = record.user_id;

		var to_save = {
			title:       title,
			description: desc,
			level:       level,
			parent_id:   parent_id,
			user_id:     user_id,
			url:         url
		};


		if(_.trim(_.escape(title)) === ''){
			res.json({
				result: false,
				message: 'Title cannot be null'
			});
		}

		if(!id){//create
			Category.find({where:{title:title, valid: 1}})
			.then(function(category){
				if(category){
					res.json({
						success: false,
						message: _.template('Category name <%=title%> exists')({title:title})
					});
				} else {
					if(parent_id){

						Category.find({where:{id:parent_id}}).then(function(parent_category){

							if(!parent_category){
								res.json({
									success: false,
									message: 'Invalid Parent Category'
								});
								return false;
							}

							to_save['level'] = 	parent_category.level + 1;
							
							Category.create(to_save)
							.then(function(category){
								res.json({
									success: true,
									message: 'Category created',
									category: category
								});
								return true;
							})
							.catch(function(error){
								res.json({
									success: false,
									error: error,
									message: 'Unable to create category'
								});
								return false;
							});		

						});

					} else {

						Category.create(to_save)
						.then(function(category){
							res.json({
								success: true,
								message: 'Category created',
								category: category
							});
						})
						.catch(function(error){
							res.json({
								success: false,
								error: error,
								message: 'Unable to create category'
							});
						});

					}
				}
			});
		} else { //update
			Category.find({where:{id:id, valid: 1}})
			.then(function(category){
				if(!category){
					res.json({
						success: false,
						message: _.template('Category name <%=title%> cannot be updated')({title:title})
					});
				} else {

					to_save.parent_id = category.parent_id;
					to_save.level     = category.level;

					if(parseInt(parent_id) === parseInt(id)){
						res.json({
							success: false,
							message: 'Cannot assign itself as the parent'
						});
						return false;
					}

					if(parent_id){

						Category.find({where:{id:parent_id}}).then(function(parent_category){

							if(!parent_category){
								res.json({
									success: false,
									message: 'Invalid Parent Category'
								});
								return false;
							}

							to_save['level'] = 	parent_category.level + 1;
							
							category.updateAttributes(to_save)
							.then(function(category){
								res.json({
									success: true,
									message: 'Category created',
									category: to_save
								});
								return true;
							})
							.catch(function(error){
								res.json({
									success: false,
									error: error,
									message: 'Unable to create category'
								});
								return false;
							});		

						});

					} else {

						category.updateAttributes(to_save)
						.then(function(category){
							res.json({
								success: true,
								message: 'Category updated',
								category: category
							});
							return true;
						})
						.catch(function(error){
							res.json({
								success: false,
								error: error,
								message: 'Unable to update category'
							});
							return false;
						});

					}
				}
			});
		}

	} else {
		res.json(result);
	}
});

router.delete('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var record = req.body;
		var id     = record.id;

		Category.find({where: {id:id}})
		.then(function(category){

			category.updateAttributes({valid:0})
			.then(function(category){
				res.json(category);
			})
			.catch(function(error){

				console.error('error:', error);

				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){

			console.error('error:', error);

			res.json({
				success: false,
				error: error 
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

			Category.findOne({where: {id: id}, valid: 1})

		).spread(function(category){
			
			if(!category){
				throw new Error('Invalid category');
			}

			var result = category;

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

module.exports = router;