
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var listAPI = require('./routes/listRoutes');
var http = require('http');
var path = require('path');

//mongo db related stuff. 
//default port: 27017
//monk is an interface for mongo. monk requires mongo
var monk = require('monk')
var db = monk('localhost:27017/rest_list_db')

//yelp yo
var yelp = require("yelp").createClient({
  consumer_key: "dpm6UN-damdiFynXIWKvVA", 
  consumer_secret: "uHq8dmot9jWiSREAYaRAkfotuFE",
  token: "PfahWEyzghSxF-qbYr_1WxbY-6UbNssn",
  token_secret: "jeqfm8nbkp5w2SVZsB2_Y6dGEKU"
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/listInfo', listAPI.getListInfo(db));
app.get('/allLists', listAPI.getAllLists(db));
app.get('/listDetails', listAPI.getListDetails(db));

app.post('/addRestToList', listAPI.addRestaurantToList(db, yelp));
app.post('/addList', listAPI.addList(db, yelp));

app.delete('/delRestFromList', listAPI.deleteRestaurantFromList(db));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// See http://www.yelp.com/developers/documentation/v2/search_api
//yelp.search({term: "Tommy Lasagna", location: "New York City", limit: 3}, function(error, data) {
//  console.log(error);
//  console.log(data);
//});

// See http://www.yelp.com/developers/documentation/v2/business
//yelp.business("yelp-san-francisco", function(error, data) {
//  console.log(error);
//  console.log(data);
//});


