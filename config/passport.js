const mongoose = require('mongoose');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy,
  JWT = require('passport-jwt').Strategy;

const Users = mongoose.model('Users');


passport.use(new LocalStrategy(
  function (username, password, done) {
    Users.findOne({ username: username }, function (err, user) {
      if (err) { return done(null, false, { error: true, errors: { 'email or password': 'is invalid' } }); }
      if (!user) { return done(null, false); }
      if (!user.validatePassword(password)) { return done(null, false, { error: true, errors: { 'email or password': 'is invalid' } }); }
      return done(null, user);
    });
  }
));
/*
passport.use(new JWT(function (jwt_payload, done) {
  User.findOne({ id: jwt_payload.sub }, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
      // or you could create a new account
    }
  });
}));*/