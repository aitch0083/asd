var DBConfig  = require('../configs/database.config');
var SZ        = require('sequelize');
var sequelize = new SZ(DBConfig.name, DBConfig.user, DBConfig.pass, DBConfig);

var Category = sequelize.define('categories', {
	//For display: 
	id:            { type: SZ.BIGINT(20).UNSIGNED,  allowNull: false, autoIncrement: true, primaryKey: true, field: 'id'},
	title:         { type: SZ.STRING(35),           allowNull: false, field: 'title'},
	level:         { type: SZ.STRING(40), 		    allowNull: false, field: 'level', defaultValue: 1},
	description:   { type: SZ.STRING(40), 		    allowNull: false, field: 'description'},
	dispaly:       { type: SZ.BOOLEAN,    		    allowNull: false, defaultValue: 1, field: 'display'},
	admin:         { type: SZ.BOOLEAN,    		    allowNull: false, defaultValue: 0, field: 'for_admin'},
	count:         { type: SZ.INTEGER(10).UNSIGNED, allowNull: false, defaultValue: 0, field: 'count'},
	totalcount:    { type: SZ.INTEGER(10).UNSIGNED, allowNull: false, defaultValue: 0, field: 'total_count'},
	position:      { type: SZ.INTEGER(10).UNSIGNED, allowNull: false, defaultValue: 0, field: 'position'},
	created:       { type: SZ.DATE, 			    allowNull: false, field: 'created'},
	modified:      { type: SZ.DATE, 			    allowNull: true,  field: 'modified'},

	//Not for display:
	parent_id: { type: SZ.BIGINT(20).UNSIGNED, allowNull: true, defaultValue: null},
	valid: { type: SZ.BOOLEAN, allowNull: false, defaultValue: 1},
	
}, {
	timestamp: true, 
	createdAt:'created', 
	updatedAt:'modified'
});

Category.belongsToMany(Category, { foreignKey:'parent_id', otherKey:'id', through:Category, as:'Children'});

Category.sync({force: false});

module.exports = Category;