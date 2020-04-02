const mongoose = require('mongoose');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const Users = mongoose.model('Users');


passport.use(new LocalStrategy(
    function(username, password, done) {
        Users.findOne({ username: username }, function (err, user) {
        if (err) { return done(null, false, {error: true, errors: { 'email or password': 'is invalid' } }); }
        if (!user) { return done(null, false); }
        if (!user.validatePassword(password)) { return done(null, false, {error: true, errors: { 'email or password': 'is invalid' } }); }
        return done(null, user);
        });
    }
));