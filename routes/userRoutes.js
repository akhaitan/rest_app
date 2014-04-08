
/*
 * GET users listing.
 */
/* Requires */
url = require('url');
exports.login = function(passport, fbStrategy) {
	return function(req, res){
		console.log("login function");
		console.log(req.user);
  		res.render('login', { user: req.user });
  	};
};

exports.populateUserDashboard = function(req, res) {
	console.log("user");
	console.log(req.user);
	var userDetails = {
		dispName: req.user.displayName,
		thumbnail: req.user.photos[0]
	};
	console.log("user details");
	console.log(userDetails);
	;
	res.render('listDashboard', {uname: req.user.displayName, uthumbnail: req.user.photos[0].value});
}