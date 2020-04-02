const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

//POST new user route (optional, everyone has access)
router.post('/register', auth.optional, (req, res, next) => {
  const reqUser = req.body;

  if(!reqUser.username) {
    return res.status(422).json({
      error: true,
      message: "username is required"
    });
  }
  if(!reqUser.email) {
    return res.status(422).json({
      error: true,
      message: "email is required"
    });
  }
  if(!reqUser.password) {
    return res.status(422).json({
      error: true,
      message: "password is required",
    });
  }

  Users.findOne({ username: reqUser.username }, function (err, user) {
    if (err) { 
      console.log("ban nahooi"); 
      return res.json({
        error: true,
        message: "error in check userExists"
      });
    }
    if (user) {
      return res.json({
        error: true,
        message: "user already exists!"
      });
    } else {
      console.log("no user");

      const finalUser = new Users(reqUser);
      finalUser.setPassword(reqUser.password);
      finalUser.money = 0;
      finalUser.generateUUID();
      return finalUser.save()
        .then(() => res.json({
          error: false,
          user: finalUser.toAuthJSON()
      }));

    }
  });

});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const user = req.body;


  if(!user.username) {
    return res.status(422).json({
      error: true,
      message: "username is required"
    });
  }

  if(!user.password) {
    return res.status(422).json({
      error: true,
      message: "password is required"
    });
  }

  if (user && user.username && user.password) {
    return passport.authenticate('local', (err, passportUser, info) => {
      if(err) {
        return next(err);
      }

      if(passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ error: false, user: user.toAuthJSON() });
      }

      return res.status(400).json({error: true, errors: info});
    })(req, res, next);
  }

  return res.json({ error: true, message: "incorrect username or password!" });
  
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({
        error: false, 
        user: user.toAuthJSON() 
      });

    });
});

//GET dupe money (auth required)
router.get('/addmoney', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }
      user.updateOne({money: user.money + 1000}).then(() => {
        res.json({
          message: "ban"
        });
      })

  });
});

module.exports = router;