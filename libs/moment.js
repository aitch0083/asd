var config               = require('../configs/global.config');
var moment               = require('moment-timezone');
var moment_with_timezone = moment.tz(config.timezone);

module.exports = moment_with_timezone;