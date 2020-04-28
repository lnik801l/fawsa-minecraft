const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');

//POST login route (optional, everyone has access)
router.post('/auth', auth.optional, (req, res, next) => {
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
        if (passportUser.activated == -1) {
          return res.json({ error: true, message: "account is banned!" });
        }
        if (passportUser.activated == 0) {
          return res.json({ error: true, message: "account is not activated!" });
        } else {
          return res.json({ error: false, message: "OK" });
        }
      }

      return res.status(400).json({error: true, errors: info});
    })(req, res, next);
  }

  return res.json({ error: true, message: "incorrect username or password!" });
  
});


module.exports = router;