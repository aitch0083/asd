var DBConfig  = require('../configs/database.config');
var SZ        = require('sequelize');
var sequelize = new SZ(DBConfig.name, DBConfig.user, DBConfig.pass, DBConfig);
var _         = require('lodash');

var Banner = sequelize.define('banners', {
	
    //For display: 
	id:            { type: SZ.BIGINT(20).UNSIGNED,  allowNull: false, autoIncrement: true, primaryKey: true, field: 'id'},
	description:   { type: SZ.STRING(100),          allowNull: false, defaultValue: '' },
    position:      { type: SZ.ENUM('1', '2', '3'),  allowNull: false , defaultValue: '1' },
    created:       { type: SZ.DATE, 			    allowNull: false, field: 'created'},
	modified:      { type: SZ.DATE, 			    allowNull: true,  field: 'modified'},

    //no display fields
    valid:      { type: SZ.BOOLEAN, allowNull: false, defaultValue: 1},
    img1:       { type: SZ.STRING(155), allowNull:false },
    url:        { type: SZ.STRING(155), allowNull: false },
    plain_url:  { type: SZ.VIRTUAL },
    target:     { type: SZ.ENUM('_self','_blank'), allowNull: false , defaultValue: '_blank' },
    online:     { type: SZ.BOOLEAN, allowNull: false },
    start_time: { type: SZ.DATE, allowNull: true  },
    end_time:   { type: SZ.DATE, allowNull: true },
    type:       { type: SZ.ENUM('huge','medium','small'), allowNull: false , defaultValue: 'medium' },
    
    is_youtube: { type: SZ.BOOLEAN , defaultValue: 0 },
    creator_id: { type: SZ.BIGINT(20).UNSIGNED, allowNull: false }

    // desprecated fields
    // img2:        { type: SZ.STRING(155) },
    // img3:        { type: SZ.STRING(155) },
    // img4:        { type: SZ.STRING(155) },
    // img5:        { type: SZ.STRING(155) },
    // img6:        { type: SZ.STRING(155) },
    // mimg:        { type: SZ.STRING(155) },
    // display_old: { type: SZ.BOOLEAN, allowNull: false , defaultValue: 0 },
    
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
                        
                    var user         = ele.getDataValue('User');
                    var id           = ele.getDataValue('id');
                    var url          = ele.getDataValue('url');
                    // var thumbnail = ele.getDataValue('thumbnail');
                    // var video_url = ele.getDataValue('video_url');

                    var seasoned_url = _.template('<a href="<%=href%>" target="_blank"><%=title%></a>')({
                        title: url,
                        href: url
                    });

                    ele.setDataValue('plain_url', url);
                    ele.setDataValue('url', seasoned_url);

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

Banner.sync();

module.exports = Banner;