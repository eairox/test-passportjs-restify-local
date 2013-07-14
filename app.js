// Modules
var restify = require("restify");
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  function(username, password, done) {
    findByUsername(username, function(err, user) {
     if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(new restify.NotAuthorizedError("Invalid password.")); }
        return done(null, user);
    });
  }
));

// Configure the server
var app = restify.createServer({
  //certificate: ...,
  //key: ...,
});
 app.use(restify.bodyParser());


//Define users
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];



function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


app.post('/login', function(req, res, next) {
 passport.authenticate('local', function(err, user, info) {

   if (err) { return next(err); }
   if (!user) { return next(new restify.NotAuthorizedError("User not found ")) }
    resMessage = {};
    resMessage.status="success";
    resMessage.user = user;

   res.send(resMessage);
   return next();


   
 })(req, res, next);
});

    
app.use(restify.conditionalRequest());

// Start the app by listening on <port>
app.listen("3000");
