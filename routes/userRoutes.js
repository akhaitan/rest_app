
/*
 * GET users listing.
 */
/* Requires */
url = require('url');
exports.login = function(passport, fbStrategy) {
	return function(req, res){
  		res.render('login', { title: 'Express' });
  	};
};

exports.populateUserDashboard = function(req, res) {
	res.render('listDashboard');
}