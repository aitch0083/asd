module.exports = {
	name: 'hue',
	host: '127.0.0.1',
	user: 'root',
	pass: '8888',
	port: 3306,
	timezone: '+08:00',
	dialectOptions: {
        dateStrings: true, //for reading from database
        typeCast: true
    },
};