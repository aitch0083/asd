var _         = require('lodash');
var DBConfig  = require('../configs/database.config');
var configs   = require('../configs/global.config');
var SZ        = require('sequelize');
var sequelize = new SZ(DBConfig.name, DBConfig.user, DBConfig.pass, DBConfig);

var Article = sequelize.define('articles', {
	
    //For display: 
	id:            { type: SZ.BIGINT(20).UNSIGNED,  allowNull: false, autoIncrement: true, primaryKey: true, field: 'id'},
	title:         { type: SZ.STRING(35),           allowNull: false, field: 'title'},
    plain_title:   { type: SZ.VIRTUAL },
	abstract:      { type: SZ.STRING(40),           allowNull: true,  field: 'abstract'},
	thumbnail:     { type: SZ.TEXT('tiny'),         allowNull: true,  field: 'thumbnail'},
    created:       { type: SZ.DATE, 			    allowNull: false, field: 'created'},
	modified:      { type: SZ.DATE, 			    allowNull: true,  field: 'modified'},

    //Not for display:
	category_id:     { type: SZ.BIGINT(20).UNSIGNED, allowNull: true, defaultValue: 0},
    user_id:         { type: SZ.BIGINT(20).UNSIGNED, allowNull: true, defaultValue: 0},
	valid:           { type: SZ.BOOLEAN, allowNull: false, defaultValue: 1},
    read_only:       { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    blocked:         { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    attached:        { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    deleted:         { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    approved:        { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    paid:            { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    at_top:          { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    global:          { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    is_target:       { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    ntf_to_fb:       { type: SZ.BOOLEAN, allowNull: false, defaultValue: 0},
    keywords:        { type: SZ.STRING(50), allowNull: true, defaultValue: ''},
    display_type:    { type: SZ.STRING(15), allowNull: true, defaultValue: 'IMAGE'},
    video_url:       { type: SZ.TEXT('tiny'), allowNull: true, defaultValue: ''},
    count:           { type: SZ.INTEGER(11).UNSIGNED, allowNull: true, defaultValue: 0},
    content:         { type: SZ.TEXT, allowNull: true, defaultValue: ''},
    created_by:      { type: SZ.ENUM('admin','usual'), allowNull: true, defaultValue: 'admin'},
    type:            { type: SZ.ENUM('usual','commercial','product'), allowNull: true, defaultValue: 'usual'},
    org_type:        { type: SZ.ENUM('usual','commercial','product'), allowNull: true, defaultValue: 'usual'},
    position:        { type: SZ.ENUM('top','middle','bottom'), allowNull: true, defaultValue: 'bottom'},
    position_weight: { type: SZ.INTEGER(5).UNSIGNED, allowNull: true, defaultValue: 0},
    promoter_id:     { type: SZ.BIGINT(20).UNSIGNED, allowNull: true, defaultValue: 0},
    approved_time:   { type: SZ.DATE, allowNull: true },
    start_time:      { type: SZ.DATE, allowNull: true, defaultValue: null }
}, {
	timestamp: true, 
	createdAt:'created', 
	updatedAt:'modified',

    hooks: {

        afterFind: function(result, options){//combine the virtual fields
            if(_.isArray(result)){
                _.each(result, function(ele, idx){
                    // You can do this evil thing: ele.dataValues.User.dataValues.author = "aitch", but don't
                    // You can also read like this: ele.dataValues.User.dataValues.author, but don't
                        
                    var category = ele.getDataValue('Category');
                    var user     = ele.getDataValue('User');

                    var id        = ele.getDataValue('id');
                    var title     = ele.getDataValue('title');
                    var thumbnail = ele.getDataValue('thumbnail');
                    var video_url = ele.getDataValue('video_url');
                    var at_top    = ele.getDataValue('at_top');
                    // var link      = _.template('<%=badge%> <%=youtuber%> <%=at_top%> <a href="<%=href%>" target="_blank"><%=title%></a>')({
                    //                     title: title,
                    //                     href: configs.site_public_url + '/articles/' + id + '.html',
                    //                     badge: thumbnail ? '<i class="material-icons green" title="with thumbnail">photo</i>' : '<i class="material-icons red" title="no thumbnail">error</i>',
                    //                     youtuber: video_url ? ' <i class="material-icons" title="it\'s a youtube article">video_library</i>' : '',
                    //                     at_top: at_top ? '<i class="material-icons orange" title="it\'s the TOP article">grade</i>' : ''
                    //                 });

                    // ele.setDataValue('plain_title', title);
                    // ele.setDataValue('title', link);

                    if(category){
                        ele.setDataValue('category_name', category.get('title'));
                    } else {
                        ele.setDataValue('category_name', 'N/A');
                    }

                    if(user){
                        ele.setDataValue('author', user.get('username'));
                    } else {
                        ele.setDataValue('author', 'N/A');
                    }
                });
            }
        }//eo afterFind
    }//eo hooks
});

Article.sync({force:false});

module.exports = Article;