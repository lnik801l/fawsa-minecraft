const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const request = require('request');
const auth = require('../auth');
const Users = mongoose.model('Users');
const EmailTokens = mongoose.model('EmailTokens');
const Money = mongoose.model('Money');

const mailer = require('../../config/mailer');
const cfg = require('../../config/constants');

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
      if (reqUser.refer)
        finalUser.refer = reqUser.refer;
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

//GET link vk profile to current logged account
router.get('/vklogin', auth.optional, (req, res, next) => {
  res.redirect('https://oauth.vk.com/authorize?client_id=' + cfg.app_id + '&redirect_uri=' + cfg.login_redirect_uri + '&display=popup&response_type=code');
});

//GET vk callback (used after user logged in vk profile using /linkvk)
router.get('/vklogin/callback', auth.optional, (req, res, next) => {

  request({
    method: 'GET',
    url: 'https://oauth.vk.com/access_token?client_id=' + cfg.app_id + '&client_secret=' + cfg.client_secret + '&redirect_uri=' + cfg.login_redirect_uri + '&code=' + req.query.code,
   }, function (error, response, body) {
   if (error) {
     console.log(error);
     return res.json({
       error: true,
       error: error
     });
   }
   if (!error && response.statusCode == 200) {

    var parsed = JSON.parse(body);

    Users.findOne({vk_id: parsed.user_id}, function(err, user) {
      if (err) {
        console.log("ban nahooi"); 
        return res.json({
          error: true,
          message: "error in check userExists",
          error: err
        });
      }
      if (!user)
        return res.json({
          error: true,
          message: "user with that vk user not found!"
        })
      if (user) {
        if (user.activated == 0) {
          return res.json({ error: true, message: "account is not activated!" });
        } else {
          const luser = user;
          luser.token = user.generateJWT();

          return res.json({ error: false, user: luser.toAuthJSON() });
        }
      }
    });
   }
  });
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
              token.delete().then(() => {
                user.updateOne({activated: 1}).then(() => {
                  return res.json({
                      error: false,
                      message: "account has activated successfully!"
                  });
                });
              });

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
          token.delete().then(() => {
            user.setPassword(json.password);
            user.save().then(() => {
              return res.json({
                error: false,
                message: "ok"
              });
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

//POST accept email change
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
          token.delete().then(() => {
            user.email = json.email;
            user.save().then(() => {
              return res.json({
                error: false,
                message: "ok"
              });
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

//GET link vk profile to current logged account
router.get('/linkvk', auth.required, (req, res, next) => {
  res.redirect('https://oauth.vk.com/authorize?client_id=' + cfg.app_id + '&redirect_uri=' + cfg.redirect_uri + '&display=popup&response_type=code');
});

//GET vk callback (used after user logged in vk profile using /linkvk)
router.get('/linkvk/callback', auth.required, (req, res, next) => {

  const { payload: { id } } = req;

  request({
    method: 'GET',
    url: 'https://oauth.vk.com/access_token?client_id=' + cfg.app_id + '&client_secret=' + cfg.client_secret + '&redirect_uri=' + cfg.redirect_uri + '&code=' + req.query.code,
   }, function (error, response, body) {
   if (error) {
     console.log(error);
     return res.json({
       error: true,
       error: error
     });
   }
   if (!error && response.statusCode == 200) {

    Users.findOne({_id: id}, function(err, user) {
      if (err) {
        console.log("ban nahooi"); 
        return res.json({
          error: true,
          message: "error in check userExists",
          error: err
        });
      }
      if (!user)
        return res.json({
          error: true,
          message: "user not found!"
        })
      var parsed = JSON.parse(body);
      Users.findOne({ vk_id: parsed.user_id}, function(err, user) {
      if (err) {
        console.log("ban nahooi"); 
        return res.json({
          error: true,
          message: "error in check userExists",
          error: err
        });
      }
      if (user)
        return res.json({
          error: true,
          message: "account with that vk user already exists!"
        });
      if (!user)
        user.updateOne({ vk_id: JSON.parse(body).user_id }).then(() => {
          return res.json({
            error: false,
            message: "vk account successfully linked!"
          });
        });
      });
    });
   }
  });
});

//GET dupe money (auth required)
router.get('/:project/addmoney', auth.required, (req, res, next) => {
  var flag = true;
  console.log(req.params.project);
  for (project in cfg.projects)
    if (project == req.params.project)
      flag = false;
  if (flag)
    return res.json({
      error: true,
      message: "project does not exists!"
    });

  const { payload: { id } } = req;
  
  Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.json({
          error: true,
          message: "error in check userExists"
        });
      }
      if (user) {
        Money.findOne({ linked_user_id: id, project: req.params.project }, function(err, money) {
          if (err)
            return res.json({
              error: true,
              message: "error in check moneyExists"
            });
          if (!money) {
            localMoney = new Money({ linked_user_id: id, project: req.params.project, money: 1000 });
            localMoney.save().then(() => {
              return res.json({
                error: false,
                message: "BANNAXYI"
              });
            });
          }
          if (money) {
            money.updateOne({ money: money.money + 1000 }).then(() => {
              return res.json({
                error: false,
                message: "BANNAXYI"
              });
            });
          }
            
        });
      }

  });
});

module.exports = router;