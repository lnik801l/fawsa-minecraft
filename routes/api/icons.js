const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const cfg = require('../../config/constants');
const { createCanvas, loadImage } = require('canvas')

//GET icon (auth optional)
router.get('/icon/:icon', auth.optional, (req, res, next) => {
    if (fs.existsSync(cfg.appDir + "/routes/api/icons/" + req.params.icon.replace(':', '.') + ".png")) {
        return res.sendFile(cfg.appDir + "/routes/api/icons/" + req.params.icon.replace(':', '.') + ".png");
        /*fs.readFile(cfg.appDir + "/routes/api/icons/" + req.params.icon.replace(':', '.') + ".png", {}, function(err, buffer) {
            if (err)
                return res.sendStatus(500);
            loadImage(buffer).then(img => {
                var oc = createCanvas(100, 100),
                    octx = oc.getContext('2d');
                octx.patternQuality = "fast";
                octx.drawImage(img, 0, 0, oc.width, oc.height);

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': oc.toBuffer().length
                });

                return res.end(oc.toBuffer());
            });

        })*/
    } else
        res.json({
            error: true,
            message: "icon can not be found!"
        });

});

module.exports = router;