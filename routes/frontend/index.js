var express      = require('express');
var SZ           = require('sequelize');
var _            = require('lodash');
var express      = require('express');
var moment       = require('../../libs/moment');
var config       = require('../../configs/global.config');
var Article      = require('../../models/article');
var User         = require('../../models/user');
var Category     = require('../../models/category');
var Banner       = require('../../models/banner');
var path         = require('path');
var fs           = require('fs');
var cheerio      = require('cheerio');
var sanitizeHtml = require('sanitize-html');

var Promise = SZ.Promise;
var now     = moment().format('YYYY-MM-DD HH:mm:ss');
var router  = express.Router();

var display_time = function(time){
	return moment(time).format('DD MMMM YYYY');
};

configs = config;

Banner.belongsTo(User, {foreignKey:'creator_id', as:'User'});

Category.belongsToMany(Category, { foreignKey:'parent_id', otherKey:'id', through:Category, as:'Children'});

router.get('/', function(req, res, next){

	var frontend_view_forlder = config.fonttend_view !== undefined ? config.fonttend_view : 'frontend';
	var title = config.frontend !== undefined && config.frontend.title !== undefined ? config.frontend.title : 'ASD';

	res.locals._      = _;
	res.locals.moment = moment;

	var top_article_count   = 5;
	var usual_article_count = 20;
	var banner_count        = 20;
	var category_conditions = {valid: 1, for_admin: 0};
	var user_conditions     = {valid: 1};
	var now                 = moment().format('YYYY-MM-DD HH:mm:ss');
	var banner_conditions   = { 
		valid: 1, 
		online: 1, 

		start_time: { 
			$or: {
				$eq: null,
				$lte: now
			}
		},

		end_time: {
			$or: {
				$eq: null,
				$gte: now
			}
		}
	};

	category_conditions['parent_id'] = 0;

	Promise.join(

		Article.findAndCountAll({
			where: {
				valid: 1,
				at_top: 1
			},
			limit: top_article_count,
			order: 'id desc',
			include: [
				{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['email', 'id', 'name'] }
			]
		}),

		Article.findAndCountAll({
			where: {
				valid: 1,
				at_top: 0
			},
			limit: usual_article_count,
			order: 'id desc',
			include: [
				{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['email', 'id', 'name'] }
			]
		}),

		Banner.findAndCountAll({
			where: banner_conditions,
			limit: banner_count,
			order: 'id desc',
			include: [
				{ model:User, as:'User', required: false, where: user_conditions, attributes:['email', 'id', 'name'] }
			]
		}),

		Category.findAndCountAll({ 
			where: category_conditions,
			include: [
				{ model: Category, as: 'Children', required: false, where: {valid: 1} }
			]
		})

	).spread(function(top_articles, usual_articles, banners, categories){

		res.locals.top_articles   = top_articles.rows;
		res.locals.usual_articles = usual_articles.rows;
		res.locals.banners        = banners.rows;
		res.locals.categories     = categories.rows;

		res.render(frontend_view_forlder + '/index', {title: title});
	});
	
});

var article_read_hanlder = function(req, res, next) {

	var id                    = parseInt(req.params.id);
	var now                   = moment().format('YYYY-MM-DD HH:mm:ss');
	var article_conditions    = { id: id, valid: 1, approved: req.query.approved || 1 };
	var category_conditions   = { valid: 1 };
	var user_conditions       = { valid: 1 };
	var cache_file_name       = path.join(__dirname, '../../public/articles/read', id + '.html');
	var frontend_view_forlder = config.fonttend_view !== undefined ? config.fonttend_view : 'frontend';

	var banner_conditions   = { 
		valid: 1, 
		online: 1, 

		start_time: { 
			$or: {
				$eq: null,
				$lte: now
			}
		},

		end_time: {
			$or: {
				$eq: null,
				$gte: now
			}
		}
	};

	//find the html cache file, if there is none, then create one
	if(fs.existsSync(cache_file_name)){

		res.sendFile(cache_file_name);

	} else {

		Promise.join(

			Article.findOne({ 
				where: article_conditions,
				include: [
					{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
					{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id', 'name'] }
				]
			}),

			Article.findAll({
				where: {valid: 1, approved: 1, '$not': {id: id}},
				limit: 10,
				order: 'id desc',
				include: [
					{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
					{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id', 'name'] }
				]
			}),

			Banner.findAll({
				where: banner_conditions,
				limit: 100,
				order: 'id desc'
			}),

			Category.findAndCountAll({ 
				where: {
					valid: 1, 
					parent_id: 0,
					admin: 0
				},
				include: [
					{ model: Category, as: 'Children', required: false, where: {valid: 1} }
				]
			})

		).spread(function(article, latest_articles, banners, first_categories){

			if(!article || article === null){
				var error = new Error('Invalid article');
				console.error('Invalid article caught:', id);
				next(error);
				return;
			}

			var category_id = article.Category.get('id');
			var title = article.get('title');

			//find the artciles under the same category
			Article.findAll({ 
				where: {
					valid: 1, 
					approved: 1, 
					category_id: category_id
				},
				limit: 10,
				order: 'RAND()',
				include: [
					{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
					{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id', 'name'] }
				]
			}).then(function(same_cate_artciles){

				res.locals.moment             = moment;
				res.locals.banners            = banners;
				res.locals.same_cate_artciles = same_cate_artciles;
				res.locals.latest_articles    = latest_articles;
				res.locals.article            = article;
				res.locals.categories         = first_categories.rows;
				res.locals.title              = title || configs.site_title;
				res.locals.configs            = configs;
				res.locals.meta               = {
					title:       article.title || configs.site_title,
					url:         configs.site_url + '/articles/read/' + article.id,
					image:       article.thumbnail,
					site_name:   configs.site_title,
					description: article.abstraction,
					fb_id:       configs.fb_id
				};
				res.locals.display_time = display_time;
				res.locals._ = _;

				res.render(frontend_view_forlder + '/article_read', function(error, html){
					if(error){	
						next(error);
					}

					fs.writeFile(cache_file_name, html);
					res.send(html);
				});
			});
			
		}).catch(function(error){
			next(error);
		}); //eo Promise

	}
};

router.get('/articles/:id', article_read_hanlder);
router.get('/articles/read/:id', article_read_hanlder);

var category_read_handler = function(req, res, next){
	var id                  = parseInt(req.params.id);
	var page                = parseInt(req.params.page);
	var now                 = moment().format('YYYY-MM-DD HH:mm:ss');
	var article_conditions  = { id: id, valid: 1, approved: 1 };
	var category_conditions = { valid: 1, id: id };
	var user_conditions     = { valid: 1 };
	var banner_conditions   = { 
		valid: 1, 
		online: 1, 

		start_time: { 
			$or: {
				$eq: null,
				$lte: now
			}
		},

		end_time: {
			$or: {
				$eq: null,
				$gte: now
			}
		}
	};

	if(isNaN(page) || page <= 0){
		page = 0;
	} 

	var offset = page * configs.frontend.category_artcile_no;
	var title = config.frontend !== undefined && config.frontend.title !== undefined ? config.frontend.title : 'ASD';
	
	Promise.join(

		Category.findOne({
			where: category_conditions
		}),

		Article.findAndCountAll({
			where: {valid: 1, approved: 1, category_id: id},
			limit: configs.frontend.category_artcile_no,
			offset: offset,
			order: 'id desc',
			include: [
				{ model:Category, as:'Category', required: true, where: category_conditions, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id', 'name'] }
			]
		}),

		Article.findAll({
			where: {valid: 1, approved: 1, '$not': {category_id: id}},
			limit: configs.latest_artcile_no,
			order: 'id desc',
			include: [
				{ model:Category, as:'Category', required: true, where: { valid: 1 }, attributes:['title', 'id'] },
				{ model:User, as:'User', required: true, where: user_conditions, attributes:['username', 'id', 'name'] }
			]
		}),

		Banner.findAll({
			where: banner_conditions,
			limit: 100,
			order: 'id desc'
		}),

		Category.findAndCountAll({ 
			where: {
				valid: 1, 
				parent_id: 0,
				admin: 0
			},
			include: [
				{ model: Category, as: 'Children', required: false, where: {valid: 1} }
			]
		})

	).spread(function(category, cate_articles, latest_articles, banners, first_categories){

		if(!category || category === null){
			var error = new Error('Invalid Category');
			console.error('Invalid category caught:', id);
			next(error);
			return;
		}

		res.locals.title           = title;
		res.locals.moment          = moment;
		res.locals.banners         = banners;
		res.locals.category        = category;
		res.locals.cate_articles   = cate_articles.rows;
		res.locals.cate_article_no = cate_articles.count;
		res.locals.latest_articles = latest_articles;
		res.locals.categories      = first_categories.rows;
		res.locals.title           = category.title + configs.frontend.site_title || title;
		res.locals.configs         = configs;

		var total_page = Math.ceil(cate_articles.count / configs.frontend.category_artcile_no);

		res.locals.meta = {
			title:       category.title,
			url:         configs.site_url + '/categories/index/' + category.id,
			site_name:   configs.site_title,
			description: category.title,
			fb_id:       configs.fb_id
		};

		res.locals.display_time = display_time;
		res.locals._ = _;

		var main_content_only     = page >= 1 ? true : false;
		var show_page_anchor      = page < total_page ? true : false;
		var frontend_view_forlder = config.fonttend_view !== undefined ? config.fonttend_view : 'frontend';

		res.render( frontend_view_forlder + '/' + (main_content_only ? 'cate_ajax_content' : 'category_index'), {show_page_anchor:show_page_anchor, page: page + 1});
	});
};

router.get('/categories/:id', category_read_handler);
router.get('/categories/index/:id', category_read_handler);
router.get('/categories/main/:id', category_read_handler);
router.get('/categories/index/:id/:page', category_read_handler);
router.get('/categories/main/:id/:page', category_read_handler);

router.get('/banners/read/:id', function(req, res, next){

});

module.exports = router;