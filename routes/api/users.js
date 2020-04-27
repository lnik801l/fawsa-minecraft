const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const EmailTokens = mongoose.model('EmailTokens');

const mailer = require('../../config/mailer');

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
      finalUser.activated = 0;
      finalUser.generateUUID();
      return finalUser.save()
        .then(() => {
          emailToken = new EmailTokens({linked_user_id: finalUser._id, type: "activate"});
          emailToken.token = emailToken.genToken();
          emailToken.save().then(() => {

            mailer.sendMail(reqUser.email, emailToken.token);
            res.json({
              error: false,
              user: finalUser.toAuthJSONreg(),
              message: "do not forget to verify your account! email already sent to you..."
            });

          });
        });

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
        if (passportUser.activated == 0) {
          return res.json({ error: true, message: "account is not activated!" });
        } else {
          const user = passportUser;
          user.token = passportUser.generateJWT();

          return res.json({ error: false, user: user.toAuthJSON() });
        }
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

//GET activate user account
router.get('/activate/:token', auth.optional, (req, res, next) => {

  EmailTokens.findOne({ token: req.params.token, type: "activate" }, function (err, token) {
    if (err) { 
      console.log("ban nahooi"); 
      return res.json({
        error: true,
        message: "error in check tokenExists"
      });
    }
    if (token) {
        Users.findOne({ _id: token.linked_user_id }, function (err, user) {
            if (err) { 
                console.log("ban nahooi"); 
                return res.json({
                  error: true,
                  message: "error in check userExists"
                });
            }
            if (user) {
                user.updateOne({activated: 1}).then(() => {
                    return res.json({
                        error: false,
                        message: "account has activated successfully!"
                    });
                })
            }
            if (!user) {
                console.log(req);
                return res.json({
                    error: true,
                    message: "vam ban ksta!"
                });
            }
        });
    } else {
        res.json({
            error: true,
            message: "invalid token!"
        });
    }
  });

});

//GET request password change
router.get('/changepassword/request/:email', auth.optional, (req, res, next) => {
  Users.findOne({ email: req.params.email }, function(error, user) {
    if (error)
      return res.json({
        error: true,
        message: "error in check userExists"
      });
    if (user) {
      emailToken = new EmailTokens({linked_user_id: user._id, type: "passwdchange"});
      emailToken.token = emailToken.genToken();
      emailToken.save().then(() => {

        mailer.sendMail(user.email, emailToken.token);
        res.json({
          error: false,
          message: "email successfully sent!"
        });

      });
    }
    if (!user)
      return res.json({
        error: true,
        message: "user with requested email not found"
      });
  });
});

//POST accept password change
router.post('/changepassword/accept', auth.optional, (req, res, next) => {
  var json = req.body;

  if (!json.token)
    return res.json({
      error: true,
      message: "token is required"
    });
  if (!json.password)
    return res.json({
      error: true,
      message: "password is required"
    });

  EmailTokens.findOne({ token: json.token, type: "passwdchange" }, function(error, token) {
    if (error)
      return res.json({
        error: true,
        message: "error in check tokenExists"
      });
    if (token)
      Users.findOne({ _id: token.linked_user_id }, function(error, user) {
        if (error)
          return res.json({
            error: true,
            message: "error in check userExists"
          });
        if (user) {
          user.setPassword(json.password);
          user.save().then(() => {
            return res.json({
              error: false,
              message: "ok"
            });
          });
          
        }
      });
  })
});

//GET request email change
router.get('/changemail/request/:email', auth.optional, (req, res, next) => {
  Users.findOne({ email: req.params.email }, function(error, user) {
    if (error)
      return res.json({
        error: true,
        message: "error in check userExists"
      });
    if (user) {
      emailToken = new EmailTokens({linked_user_id: user._id, type: "mailchange"});
      emailToken.token = emailToken.genToken();
      emailToken.save().then(() => {

        mailer.sendMail(user.email, emailToken.token);
        res.json({
          error: false,
          message: "email successfully sent!"
        });

      });
    }
    if (!user)
      return res.json({
        error: true,
        message: "user with requested email not found"
      });
  });
});

//POST accept password change
router.post('/changemail/accept', auth.optional, (req, res, next) => {
  var json = req.body;

  if (!json.token)
    return res.json({
      error: true,
      message: "token is required"
    });
  if (!json.email)
    return res.json({
      error: true,
      message: "email is required"
    });

  EmailTokens.findOne({ token: json.token, type: "mailchange" }, function(error, token) {
    if (error)
      return res.json({
        error: true,
        message: "error in check tokenExists"
      });
    if (token)
      Users.findOne({ _id: token.linked_user_id }, function(error, user) {
        if (error)
          return res.json({
            error: true,
            message: "error in check userExists"
          });
        if (user) {
          user.email = json.email;
          user.save().then(() => {
            return res.json({
              error: false,
              message: "ok"
            });
          });
          
        }
      });
    if (!token)
      return res.json({
        error: true,
        message: "token not found"
      });
  })
});

module.exports = router;