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

var user_conditions = {valid: 1};

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
	'name',
	'username',
	'email',
	'about_me',
	'type',
	'sex',
	'created',
	'modified'
];

router.get('/get_list', function(req, res, next){
	var query = req.query.q;
	var uid   = req.query.id;

	// console.info('uid:', uid);
	
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

	if(uid){
		User.findOne({where: {id: uid}}).then(function(record){
			
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
	
	User.findAndCountAll({ where: { valid: 1 } })
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

router.post('/login', function(req, res, next){

	var username = req.body.username;
	var password = req.body.password;
	
	var result   = {
		success: false,
		message: "message.login_failed"
	};

	if(!username || !password){
		res.json(result);
	}

	User.findOne({ where: { email: username, password: password, valid: 1 } })
		.then(function(user){
			if(!user){
				result.message = "message.user_invalid";
			} else {
				result.success = true;
				result.message = "message.login_succeeded";

				req.session.user          = user.dataValues;
				req.session.user.password = null;

				result.user = user.dataValues;
			}

			res.json(result);
		});
	// EO User.findOne()
});//eo /login

router.post('/logout', function(req, res, next){

	var user = req.session.user;

	// console.info('/logout, session user:', user);

	req.session.destroy();

	res.json({
		success: true,
		message: "message.logout_succeeded"
	});

});//eo /logout

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

	var offset = (current - 1) * rowCount;

	Promise.join(

		User.findAndCountAll({
			where: user_conditions,
			limit: rowCount,
			offset: offset,
			order: order
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

		var user_record = req.body;
		var email       = user_record.email;

		if(_.trim(_.escape(email)) === ''){
			res.json({
				result: false,
				message: 'Email cannot be null'
			});
		}

		User.find({where:{email:email, valid: 1}})
		.then(function(user){
			if(user){
				res.json({
					success: false,
					message: _.template('Email <%=email%> exists')({email:email})
				});
			} else {

				user_record['username'] = email;

				User.create(user_record).then(function(user){
					res.json(user);
				}).catch(function(error){
					res.json({
						success: false,
						error: error 
					});
				});
			}
		})
		.catch(function(error){
			res.json({
				success: false,
				error: error 
			});
		});

	}else {
		res.json(result);
	}
});

router.put('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var user_record = req.body;
		var id          = user_record.id;

		User.find({where:{id:id}})
		.then(function(user){

			user.updateAttributes(user_record).then(function(user){
				res.json(user_record);
			})
			.catch(function(error){
				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){
			res.json({
				success: false,
				error: error 
			});
		});

	}else {
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

			User.findOne({where: {id: id}, valid: 1})

		).spread(function(user){
			
			if(!user){
				throw new Error('Invalid user');
			}

			var result = user;

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

router.delete('/', function(req, res, next) {
	var result = validator(req, res);

	if(result.success){

		var user_record = req.body;
		var id          = user_record.id;

		User.find({where:{id:id}})
		.then(function(user){

			user.updateAttributes({valid:0})
			.then(function(user){
				res.json(user_record);
			})
			.catch(function(error){
				res.json({
					success: false,
					error: error 
				});
			});
		})
		.catch(function(error){
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

