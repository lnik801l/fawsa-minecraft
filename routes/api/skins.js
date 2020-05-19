const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Skins = mongoose.model('Skins');
const { Image } = require('image-js');
const cfg = require('../../config/constants');
const fs = require("fs");
const utils = require('../../utils');

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
router.post('/:project/uploadskin', auth.optional, (req, res, next) => {
    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
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

                                        Skins.findOne({ linked_uuid: user.uuid, linked_projectname: req.params.project }, function(err, skin) {
                                            if (err) {
                                                console.log("ban nahooi");
                                                return res.json({
                                                    error: true,
                                                    message: "error in check skinExists"
                                                });
                                            }
                                            if (skin) {
                                                skin.updateOne({ skin: base64Data }).then(() => {
                                                    return res.json({
                                                        error: false,
                                                        width: image.width,
                                                        height: image.height
                                                    });
                                                });
                                            } else {
                                                console.log("no skin");

                                                const newSkin = new Skins({
                                                    linked_uuid: user.uuid,
                                                    linked_projectname: req.params.project,
                                                    skin: base64Data
                                                });
                                                return newSkin.save()
                                                    .then(() => res.json({
                                                        error: false,
                                                        message: 'Операция прошла успешно!',
                                                        width: image.width,
                                                        height: image.height
                                                    }));

                                            }
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
    } else {
        return res.json({
            error: true,
            message: "authorization required!"
        });
    }

});

router.get('/:project/skin/:uuid.png', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    Skins.findOne({ linked_uuid: req.params.uuid, linked_projectname: req.params.project }, function(err, skin) {
        if (err) {
            console.log(err);
            return res.json({
                error: true,
                message: "error in check skinExists"
            });
        }
        if (skin && skin.skin.length > 1) {
            const im = skin.skin;

            const img = Buffer.from(im, 'base64');

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });

            res.end(img);
        } else {
            res.sendFile(cfg.appDir + cfg.skinsDir + req.params.project + "/default.png");
        }
    });
});

router.get('/:project/deleteskin', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
                    return res.sendStatus(400);
                } else {

                    Skins.findOne({ linked_uuid: user.uuid, linked_projectname: req.params.project }, function(err, skin) {
                        if (err) {
                            console.error(err);
                            return res.json({
                                error: true,
                                message: "error in check skinExists"
                            });
                        }
                        if (skin) {
                            skin.updateOne({ skin: "" }).then(() => {
                                return res.json({
                                    error: false,
                                    message: "ok"
                                });
                            });

                        } else {
                            res.json({
                                error: true,
                                message: "upload skin before delete!"
                            })
                        }
                    });

                }

            });
    } else {
        return res.json({
            error: true,
            message: "authorization required!"
        });
    }

});
//POST upload cloak route (auth required)
router.post('/:project/uploadcloak', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
                    return res.sendStatus(400);
                } else {

                    if (req.body.image) {
                        const rawimage = req.body.image;
                        try {
                            new Image.load(rawimage).then(image => {

                                if (image != null) {

                                    if (isCloakCorrect(image)) {
                                        var base64Data = rawimage.replace(/^data:image\/png;base64,/, "");
                                        //write file to ./api/skins/:project/:servername/skins/{uuid}.png

                                        Skins.findOne({ linked_uuid: user.uuid, linked_projectname: req.params.project }, function(err, skin) {
                                            if (err) {
                                                console.error(err);
                                                return res.json({
                                                    error: true,
                                                    message: "error in check skinExists"
                                                });
                                            }
                                            if (skin) {
                                                skin.updateOne({ cloak: base64Data });
                                                return res.json({
                                                    error: false,
                                                    width: image.width,
                                                    height: image.height
                                                });
                                            } else {
                                                console.log("no skin");

                                                const newSkin = new Skins({
                                                    linked_uuid: user.uuid,
                                                    linked_projectname: req.params.project,
                                                    cloak: base64Data
                                                });
                                                return newSkin.save()
                                                    .then(() => res.json({
                                                        error: false,
                                                        width: image.width,
                                                        height: image.height
                                                    }));

                                            }
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
    } else {
        return res.json({
            error: true,
            message: "authorization required!"
        });
    }

});

router.get('/:project/deletecloak', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
                    return res.sendStatus(400);
                } else {

                    Skins.findOne({ linked_uuid: user.uuid, linked_projectname: req.params.project }, function(err, skin) {
                        if (err) {
                            console.error(err);
                            return res.json({
                                error: true,
                                message: "error in check skinExists"
                            });
                        }
                        if (skin) {
                            skin.updateOne({ cloak: "" });
                            return res.json({
                                error: false,
                                message: "ok"
                            });
                        } else {
                            res.json({
                                error: false,
                                message: "upload cloak before delete!"
                            })
                        }
                    });

                }

            });
    } else {
        return res.json({
            error: true,
            message: "authorization required!"
        });
    }

});

router.get('/:project/cloak/:uuid.png', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    Skins.findOne({ linked_uuid: req.params.uuid, linked_projectname: req.params.project }, function(err, skin) {
        if (err) {
            console.error(err);
            return res.json({
                error: true,
                message: "error in check skinExists"
            });
        }
        if (skin && skin.cloak && skin.cloak.length > 1) {
            const im = skin.cloak;
            console.log(im);

            const img = Buffer.from(im, 'base64');

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });

            res.end(img);
        } else {
            res.json({
                error: true,
                message: "skin is null!"
            });
        }
    });
});

router.get('/:project/preview/:uuid/:side', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    Skins.findOne({ linked_uuid: req.params.uuid, linked_projectname: req.params.project }, function(err, skin) {
        if (err) {
            console.error(err);
            return res.json({
                error: true,
                message: "error in check skinExists"
            });
        }

        if (req.params.side == "head") {

            if (skin && skin.skin.length > 1) {
                const im = skin.skin;

                const imgbuff = Buffer.from(im, 'base64');

                loadImage(imgbuff).then(img => {

                    const localHead = getPart(img, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 1);
                    var ctx = localHead.getContext('2d');
                    var armorHead = getPart(img, 40 * img.width / 64, 8 * img.width / 64, 40 * img.width / 64, 8 * img.width / 64, 1);
                    ctx.drawImage(armorHead, 0, 0, armorHead.width, armorHead.height);
                    var oc = createCanvas(100, 100),
                        octx = oc.getContext('2d');
                    octx.patternQuality = "fast";
                    octx.drawImage(localHead, 0, 0, oc.width, oc.height);

                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': oc.toBuffer().length
                    });

                    res.end(oc.toBuffer());

                });
            } else {
                loadImage(fs.readFileSync(cfg.appDir + cfg.skinsDir + req.params.project + "/default.png")).then(img => {

                    const localHead = getPart(img, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 8 * img.width / 64, 1);
                    var ctx = localHead.getContext('2d');
                    var armorHead = getPart(img, 40 * img.width / 64, 8 * img.width / 64, 40 * img.width / 64, 8 * img.width / 64, 1);
                    ctx.drawImage(armorHead, 0, 0, armorHead.width, armorHead.height);
                    var oc = createCanvas(100, 100),
                        octx = oc.getContext('2d');
                    octx.patternQuality = "fast";
                    octx.drawImage(localHead, 0, 0, oc.width, oc.height);

                    var img = oc.toBuffer();

                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': img.length
                    });
                    res.end(img);

                });
            }

        } else return res.json({
            error: true,
            message: "unsupported side!"
        });
    });

});

module.exports = router;