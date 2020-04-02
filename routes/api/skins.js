const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const { Image } = require('image-js');
const cfg = require('../../config/constants');
const fs = require("fs");

const { createCanvas, loadImage } = require('canvas')


function isSkinCorrect(image) {
    if (image.width == 64 & image.height == 64)
        return true;
    if (image.width == 128 & image.height == 64)
        return true;
    if (image.width == 256 & image.height == 128)
        return true;
    if (image.width == 512 & image.height == 256)
        return true;
    if (image.width == 1024 & image.height == 512)
        return true;
    return false;
}

function isCloakCorrect(image) {
    if (image.width == 22 & image.height == 17)
        return true;
    if (image.width == 64 & image.height == 32)
        return true;
    if (image.width == 64 & image.height == 64)
        return true;
    if (image.width == 128 & image.height == 64)
        return true;
    if (image.width == 256 & image.height == 128)
        return true;
    if (image.width == 512 & image.height == 256)
        return true;
    if (image.width == 1024 & image.height == 512)
        return true;
    return false;
}

function getPart(src, x, y, width, height, scale) {

    const canvas = createCanvas(scale * width, scale * height);
    const ctx = canvas.getContext('2d');
  
    // don't blur on resize
    ctx.patternQuality = "fast";
  
    ctx.drawImage(src, x, y, width, height, 0, 0, width * scale, height * scale);
    return canvas;
  }

//POST upload skin route (auth required)
router.post('/:project/:servername/uploadskin', auth.optional, (req, res, next) => {
    var boolean = false;

    for (project in cfg.projects) 
        for (server in cfg.projects[project])
            if (req.params.servername == server)
                boolean = true;
    
    if (!boolean)
      return res.json({
        error: true,
        message: "server or project does not exists!"
      });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
        .then((user) => {
        if(!user) {

            return res.sendStatus(400);

        } else {

            if (req.body.image) {
                const rawimage = req.body.image;
                try {
                    new Image.load(rawimage).then(image => {

                        if (image != null) {

                            if (isSkinCorrect(image)) {
                                var base64Data = rawimage.replace(/^data:image\/png;base64,/, "");
                                //write file to ./api/skins/:project/:servername/skins/{uuid}.png
                                fs.writeFile(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/" + user.getUUID() + ".png", base64Data, 'base64', function(err) {
                                    if (err != null)
                                        console.log(err);
                                });
                                return res.json({
                                    error: false,
                                    width: image.width,
                                    height: image.height
                                }); 
                            } else {
                                return res.json({
                                    error: true,
                                    message: "incorrect image!"
                                }); 
                            }

                            
                        }

                    });
                } catch (e) {
                    return res.json({
                        error: true,
                        message: "corrupted image!"
                    }); 
                }


            } else {
                return res.json({
                    error: true, 
                    message: "image null!"
                });
            }

        }

        });
    }
    else {
        return res.json({
            error: true, 
            message: "authorization required!"
        });
    }

});

router.get('/:project/:servername/skin/:uuid.png', auth.optional, (req, res, next) => {
    var boolean = false;

    for (project in cfg.projects) 
        for (server in cfg.projects[project])
            if (req.params.servername == server)
                boolean = true;
    
    if (!boolean)
      return res.json({
        error: true,
        message: "server or project does not exists!"
      });

    if (fs.existsSync(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/" + req.params.uuid + ".png")) {
        res.sendFile(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/" + req.params.uuid + ".png");
    } else {
        res.sendFile(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/default.png");
    }
});

//POST upload cloak route (auth required)
router.post('/:project/:servername/uploadcloak', auth.optional, (req, res, next) => {
    var boolean = false;

    for (project in cfg.projects) 
        for (server in cfg.projects[project])
            if (req.params.servername == server)
                boolean = true;
    
    if (!boolean)
      return res.json({
        error: true,
        message: "server or project does not exists!"
      });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
        .then((user) => {
        if(!user) {

            return res.sendStatus(400);

        } else {

            if (req.body.image) {
                const rawimage = req.body.image;
                try {
                    new Image.load(rawimage).then(image => {

                        if (image != null) {

                            if (isCloakCorrect(image)) {
                                var base64Data = rawimage.replace(/^data:image\/png;base64,/, "");
                                //write file to .{cfg.skinsDir}/:project/:servername/{uuid}.png
                                fs.writeFile(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/cloaks/" + user.getUUID() + ".png", base64Data, 'base64', function(err) {
                                    console.log(err);
                                });
                                return res.json({
                                    error: false,
                                    width: image.width,
                                    height: image.height
                                }); 
                            } else {
                                return res.json({
                                    error: true,
                                    message: "incorrect image!"
                                }); 
                            }

                            
                        }

                    });
                } catch (e) {
                    return res.json({
                        error: true,
                        message: "corrupted image!"
                    }); 
                }


            } else {
                return res.json({
                    error: true, 
                    message: "image null!"
                });
            }

        }

        });
    }
    else {
        return res.json({
            error: true, 
            message: "authorization required!"
        });
    }

});

router.get('/:project/:servername/cloak/:uuid.png', auth.optional, (req, res, next) => {
    var boolean = false;

    for (project in cfg.projects) 
        for (server in cfg.projects[project])
            if (req.params.servername == server)
                boolean = true;
    
    if (!boolean)
      return res.json({
        error: true,
        message: "server or project does not exists!"
      });

    if (fs.existsSync(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/cloaks/" + req.params.uuid + ".png")) {
        res.sendFile(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/cloaks/" + req.params.uuid + ".png");
    } else {
        res.json({
            error: true,
            message: "cloak is null!"
        });
    }
});

router.get('/:project/:servername/preview/:uuid/:side', auth.optional, (req, res, next) => {
    var boolean = false;

    for (project in cfg.projects) 
        for (server in cfg.projects[project])
            if (req.params.servername == server)
                boolean = true;
    
    if (!boolean)
      return res.json({
        error: true,
        message: "server or project does not exists!"
      });

    if (fs.existsSync(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/" + req.params.uuid + ".png")) {
        var skinPath = cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/" + req.params.uuid + ".png";
    } else {
        var skinPath = cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/skins/default.png";
    }
    if (fs.existsSync(cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/cloaks/" + req.params.uuid + ".png")) {
        var cloakPath = cfg.appDir + cfg.skinsDir + req.params.project + "/" + req.params.servername + "/cloaks/" + req.params.uuid + ".png";
    } else {
        var cloakPath = null;
    }

    if (req.params.side == "head")
        loadImage(fs.readFileSync(skinPath)).then(img => {
            const localHead = getPart(img, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 1);
            var ctx = localHead.getContext('2d');
            var armorHead = getPart(img, 40 * img.width / 64, 8 * img.width / 64, 40 * img.width / 64, 8 * img.width / 64, 1);
            ctx.drawImage(armorHead, 0, 0, armorHead.width, armorHead.height);

            var oc = createCanvas(100, 100),
            octx = oc.getContext('2d');
            octx.patternQuality = "fast";
            octx.drawImage(localHead, 0, 0, oc.width, oc.height);
            
            res.send("<img src=\""+ oc.toDataURL() + "\" />");

        });
    else return res.json({
        error: true,
        message: "unsupported side!"
    });  

});

module.exports = router;