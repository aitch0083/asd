var config = require('../configs/global.config');
var moment = require('moment-timezone');

moment.tz.setDefault(config.timezone);

module.exports = moment;