
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var userAPI = require('./routes/userRoutes');
var listAPI = require('./routes/listRoutes');
var http = require('http');
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
	console.log('--------------------------');
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log('deserializing');
  done(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: 218193641713381,
    clientSecret: 'c93905acf143a01f0effaae1e1e01417',
    callbackURL: "http://localhost.local:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
    //asynchronous verification
    process.nextTick(function () {
      console.log("prof");
      console.log(profile);
      // the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


//mongo db related stuff. 
//default port: 27017
//monk is an interface for mongo. monk requires mongo
var monk = require('monk')
//var db = monk('localhost.local:27017/rest_list_db')
var db = monk('mongodb://akhaitan10:ayush2cool@ds037987.mongolab.com:37987/heroku_app23307491')
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
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//User Dashboard routes
app.get('/', routes.index);
app.get('/userDashboard', userAPI.populateUserDashboard);
app.get('/listInfo', listAPI.getListInfo(db));
app.get('/allLists', listAPI.getAllLists(db));
app.get('/listDetails', listAPI.getListDetails(db));

app.post('/addRestToList', listAPI.addRestaurantToList(db, yelp));
app.post('/addList', listAPI.addList(db, yelp));

app.delete('/delRestFromList', listAPI.deleteRestaurantFromList(db));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.get('/profile2', function(req, res) {
    console.log("profile2");
    console.log(req.user);
    console.log("-----");
    //console.log(req);
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

//Login Routes
app.get('/login', userAPI.login(passport, FacebookStrategy));
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/userDashboard' }));

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


