var SZ           = require('sequelize');
var _            = require('lodash');
var express      = require('express');
var moment       = require('../../libs/moment');
var config       = require('../../configs/global.config');
var Article      = require('../../models/article');
var User         = require('../../models/user');
var Category     = require('../../models/category');
var path         = require('path');
var fs           = require('fs');
var cheerio      = require('cheerio');
var sanitizeHtml = require('sanitize-html');

var Promise = SZ.Promise;
var now     = moment().format('YYYY-MM-DD HH:mm:ss');
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

//GLOBAL conditions
var article_conditions  = {valid: 1};
var category_conditions = {};
var user_conditions     = {};

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

Article.belongsTo(User, {foreignKey:'user_id', as:'User'});
Article.belongsTo(Category, {foreignKey:'category_id', as:'Category'});

router.get('/new', function(req, res, next){

	var signed_user = req.session.user;

	if(!signed_user && !config.debug){
		
		res.json({
			success: false,
			message: "message.login_required"
		});

		return false;
	}

	if(config.debug){
		signed_user = {
			id: 1
		};
	}

	let now = moment();

	Article.create({
		title: 'new article ('+now.format('YYYY-MM-DD HH:mm')+')',
		valid: 1,
		start_time: null,
		approved: 0,
		at_top: 0,
		user_id: signed_user.id
	})
	.then(function(article){
		article.category_id = null;
		res.json({
			success: true,
			message: 'Article created',
			record: article
		});
	})
	.catch(function(error){
		res.json({
			success: false,
			error: error,
			message: 'Unable to create article'
		});
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

	if(sort_col === 'category'){
		order = 'Category.title ' + sort_dir;
	}

	if(sort_col === 'author'){
		order = 'User.name ' + sort_dir;
	}

	if(searchPhrase){

		article_conditions['$or']  = {};
		
		article_conditions['$or']['title']      = { '$like': '%' + searchPhrase + '%' };
		article_conditions['$or']['abstract']   = { '$like': '%' + searchPhrase + '%' };
		article_conditions['$or']['start_time'] = { '$like': '%' + searchPhrase + '%' };
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
	
});//eo /index

router.get('/:id', function(req, res, next) {
	
	var result = validator(req, res);

	if(result.success){

		var id = req.params.id;

		if(!id){
			throw new Error('Invalid article ID');
		} 

		Article.findOne({where: {id: id}, valid: 1}).then(function(result){

			if(!result){
				throw new Error('Invalid article');
			}

			res.json({
				success: true,
				record: result
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

		// console.info('req.body:', req.body);

		var record = req.body;
		var id     = record.id;

		Article.find({where:{id:id}})
		.then(function(article){

			//find the first image in the content
			var $document = cheerio.load(record.content);
			var first_img = $document('img').first();

			if(first_img){
				record.thumbnail = first_img.attr('src');
			}
			
			record.content = sanitizeHtml(record.content, {
				allowedTags: [ 
				  'h1','h2','h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
				  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br', 'div', 'img',
				  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe',
				  'font', 'span'
				],
				allowedAttributes: {
				  a:    [ 'href', 'name', 'target', 'title'],
				  img:  [ 'src', 'style', 'class' ],
				  font: [ 'face', 'style'],
				  span: [ 'style'],
				  div:  [ 'style', 'class' ],
				  iframe: ['style', 'src', 'width', 'height', 'frameborder', 'allowfullscreen', 'class']
				},
				// Lots of these won't come up by default because we don't allow them 
				selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
				// URL schemes we permit 
				allowedSchemes: [ 'http', 'https', 'mailto' ],
				allowProtocolRelative: true,
				transformTags: {
					'br' : 'p'
				}
			});

			article.updateAttributes(record).then(function(article){

				//clear the cache if any
				var cache_file_name = (config.frontend_location !== undefined ? config.frontend_location : '') + '/public/articles/read/' + id + '.html';

				if(fs.existsSync(cache_file_name)){
					fs.unlink(cache_file_name);
				}

				res.json({
					success: true,
					record: article
				});
			})

			.catch(function(error){

				console.info('error @ /articles PUT:', error);

				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){

			console.info('error @ /articles PUT:', error);

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

		Article.find({where:{id:id}})
		.then(function(article){

			article.updateAttributes({valid:0})
			.then(function(article){
				res.json(article);
			})
			.catch(function(error){
				console.info('Error @article delete:', error);
				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){
			console.info('Error @article delete:', error);
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