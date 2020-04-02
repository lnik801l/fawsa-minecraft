const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const cfg = require('../../config/constants');


//GET icon (auth optional)
router.get('/icon/:icon', auth.optional, (req, res, next) => {
    if (fs.existsSync(cfg.appDir + "/routes/api/icons/" + req.params.icon.replace(':', '.') + ".png"))
        res.sendFile(cfg.appDir + "/routes/api/icons/" + req.params.icon.replace(':', '.') + ".png");
    else
        res.json({
            error: true,
            message: "icon can not be found!"
        });
    
});

module.exports = router;