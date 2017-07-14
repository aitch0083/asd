var toastr = require('toastr');

module.exports = function(title, message, type, options){
	
	type = type || 'info';

	options = options || {
		preventDuplicates: true,
		positionClass: "toast-top-center"
	};

	toastr[type](title, message, options);
};