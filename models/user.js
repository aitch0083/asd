var DBConfig  = require('../configs/database.config');
var SZ        = require('sequelize');
var sequelize = new SZ(DBConfig.name, DBConfig.user, DBConfig.pass, DBConfig);

var User = sequelize.define('users', {
	id:       { type: SZ.BIGINT(20).UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true, field: 'id'},
	name:     { type: SZ.STRING(35), allowNull: false, field: 'name'},
	username: { type: SZ.STRING(35), allowNull: false, field: 'username'},
	email:    { type: SZ.STRING(40), allowNull: false, field: 'email'},
	password: { type: SZ.STRING(40), allowNull: true, field: 'password'},
	about_me: { type: SZ.STRING(255), allowNull: true, field: 'about_me'},
	type:     { type: SZ.ENUM('usual','admin'), defaultValue: 'usual', field:'type'},
	sex:      { type: SZ.ENUM('male','female','unknown'), allowNull: false, defaultValue: 'unknown', field: 'sex'},
	valid:    { type: SZ.BOOLEAN, allowNull: false, defaultValue: 1},
	created:  { type: SZ.DATE, allowNull: false, field: 'created'},
	modified: { type: SZ.DATE, allowNull: true, field: 'modified'}
}, {
	timestamp: true, 
	createdAt:'created', 
	updatedAt:'modified',
	indexes: [
		{
			unique: true,
			fields: ['email']
		}
	]
});

User.sync({force: false});

module.exports = User;