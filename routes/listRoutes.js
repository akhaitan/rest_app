/* Methods related to list management */

/* Requires */
url = require('url');

/* Method to return information about a particular list 
 * TODO: Pass in list id */
exports.getListInfo = function(db) {
	return function(req, res) {
		;
	};
};

exports.getAllLists = function (db) {
	console.log("*******getting all lists");
	return function (req, res) {
		console.log("------");
		var allListsTable = db.get('listsSandbox');
		allListsTable.find({}, {fields:{contributors:0, restaurants:0}}, function(e, lists){
			console.log("------------returning");
			console.log(e);
			console.log(lists);
			res.json(lists);
		});
	};
};

exports.getListDetails = function(db) {
	return function(req, res) {
		var url_variables = url.parse(req.url, true);
		var listId =  url_variables.query.listId;
		console.log("list id is ", listId);
		var allListsTable = db.get('listsSandbox');
		allListsTable.find({listId:listId}, {}, function(e, listDetails) {
			console.log("---");
			console.log(e);
			console.log(listDetails);
			console.log(listDetails[0].restaurants);
			console.log(listDetails[0]);
			res.json({
				listname: listDetails[0].name,
				restaurants: listDetails[0].restaurants
			});
		});
	};
};

/* Function to add a new  list */
exports.addList = function(db, yelp) {
	return function(req, res) {
		console.log("adding new list");
		console.log(req.body);
		var allListsTable = db.get('listsSandbox');
		allListsTable.insert(req.body, function(error, msg) {							
			res.send(
				(error === null) ? { msg: '' } : { msg: error }
		    );
		});
	};
};


/* Function to add a restaurant to a list */
exports.addRestaurantToList = function(db, yelp) {
	return function(req, res) {
		console.log("adding restaurant to list");
		console.log(req.body);
		yelp.search({term: req.body.name, location: "New York City", limit: 3}, function(error, data) {
			console.log(data);
			console.log("yelp returned "  + (data.businesses.length) + " businesses");

			restDetails = {};
			yelpDetails = data.businesses[0];
			console.log("Details:");
			console.log(yelpDetails.categories);
			restDetails.name = yelpDetails.name;
			restDetails.cuisine = yelpDetails.categories[0][0];
			restDetails.stars = yelpDetails.rating_img_url;
			restDetails.website = yelpDetails.url;
			restDetails.phone = yelpDetails.display_phone;
			restDetails.address = yelpDetails.location.address[0];

			console.log(restDetails);

			var allListsTable = db.get('listsSandbox');

			allListsTable.update({listId:req.body.listId}, {$push: {restaurants: restDetails}}, function(error, data) {
				
				res.send(
					(error === null) ? { msg: '' } : { msg: error }
			    );

			});
		});
	};
};