const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');

const mongoose = require('mongoose');
const { token } = require('morgan');
const Users = mongoose.model('Users');
const si = mongoose.model('sashok_infos');
const cfg = require('../../config/constants');

//POST login route (optional, everyone has access)
router.post('/auth', auth.optional, (req, res, next) => {
  const user = req.body;

  if (!user.username) {
    return res.status(422).json({
      error: true,
      message: "username is required"
    });
  }

  if (!user.password) {
    return res.status(422).json({
      error: true,
      message: "password is required"
    });
  }

  if (user && user.username && user.password) {
    return passport.authenticate('local', (err, passportUser, info) => {
      if (err) {
        return next(err);
      }
      if (passportUser) {
        if (passportUser.activated == -1) {
          return res.json({ error: true, message: "account is banned!" });
        }
        if (passportUser.activated == 0) {
          return res.json({ error: true, message: "account is not activated!" });
        } else {
          return res.json({ error: false, message: "OK:" + user.username });
        }
      }

      return res.status(200).json({ error: true, errors: info });
    })(req, res, next);
  }

  return res.status(200).json({ error: true, message: "incorrect username or password!" });

});

//GET usernamefetch route for sashok724 launcher
router.get('/sashok/usernamefetch', auth.optional, (req, res, next) => {

  if (!req.query.user)
    return res.json({
      error: true,
      uuid: "null",
      access_token: "null",
      serverid: "null"
    })

  Users.findOne({ username: req.query.user }).then(u => {
    if (!u)
      return res.json({
        error: true,
        uuid: "null",
        access_token: "null",
        serverid: "null"
      })
    if (u) {
      si.findOne({ linked_user_id: u._id }).then(sashok_info => {
        if (!sashok_info)
          return res.json({
            uuid: u.uuid,
            access_token: "null",
            serverid: "null"
          });

        return res.json({
          uuid: u.uuid,
          access_token: sashok_info.access_token,
          serverid: sashok_info.serverid == null ? "null" : sashok_info.serverid
        });
      });
    }
  });
});

//GET uuidfetch route for sashok724 launcher
router.get('/sashok/uuidfetch', auth.optional, (req, res, next) => {

  if (!req.query.uuid)
    return res.json({
      error: true,
      username: "null",
      access_token: "null",
      serverid: "null"
    })

  Users.findOne({ uuid: req.query.uuid }).then(u => {
    if (!u)
      return res.json({
        error: true,
        username: "null",
        access_token: "null",
        serverid: "null"
      })
    if (u) {
      si.findOne({ linked_user_id: u._id }).then(sashok_info => {
        if (!sashok_info)
          return res.json({
            username: u.username,
            access_token: "null",
            serverid: "null"
          });

        return res.json({
          username: u.username,
          access_token: sashok_info.access_token,
          serverid: sashok_info.serverid
        });
      });
    }
  });
});

//GET updateauth route for sashok724 launcher
router.get('/sashok/updateauth', auth.optional, (req, res, next) => {

  if (!req.query.user || !req.query.token)
    return res.status(500).json({
      error: true,
      message: "неверные параметры!"
    });

  Users.findOne({ username: req.query.user }).then(u => {
    if (!u)
      return res.status(500).json({
        error: true,
        message: "юзер не найден!"
      });
    if (u) {
      si.findOne({ linked_user_id: u._id }).then(sashok_info => {
        if (!sashok_info)
          new si({ "linked_user_id": u._id, "access_token": req.query.token, "serverid": "null" }).save().then(() => {
            return res.status(200).json({
              error: true,
              message: "OK"
            });
          })
        if (sashok_info) {
          sashok_info.access_token = req.query.token;
          sashok_info.save().then(() => {
            return res.status(200).json({
              error: true,
              message: "OK"
            });
          })
        }
      });
    }
  });
});

//GET updateserverid route for sashok724 launcher
router.get('/sashok/updateserverid', auth.optional, (req, res, next) => {

  if (!req.query.serverid || !req.query.uuid)
    return res.status(500).json({
      error: true,
      message: "неверные параметры!"
    });

  Users.findOne({ uuid: req.query.uuid }).then(u => {
    if (!u)
      return res.status(500).json({
        error: true,
        message: "юзер не найден!"
      });
    if (u) {
      si.findOne({ linked_user_id: u._id }).then(sashok_info => {
        if (!sashok_info)
          new si({ "linked_user_id": u._id, "access_token": "null", "serverid": req.query.uuid }).save().then(() => {
            return res.status(200).json({
              error: true,
              message: "OK"
            });
          })
        if (sashok_info) {
          sashok_info.serverid = req.query.serverid;
          sashok_info.save().then(() => {
            return res.status(200).json({
              error: true,
              message: "OK"
            });
          })
        }
      });
    }
  });
});




module.exports = router;