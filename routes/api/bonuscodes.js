const mongoose = require('mongoose');
const router = require('express').Router();
const Users = mongoose.model('Users');
const Money = mongoose.model('Money');

const cfg = require('../../config/constants');
const utils = require('../../modules/utils');
const bonuscodesschema = require('../../per-project-schemas/bonuscodes').schema;
const bonuscodesusersschema = require('../../per-project-schemas/bonuscodes_usedbyusers').schema;
const auth = require('../auth');

let delOldCodes = function () {
    for (project in cfg.projects) {
        const model = cfg.projects[project].settings.database.model('bonuscodes', bonuscodesschema);
        //const model = cfg.projects.galaxy.settings.database.model('bonuscodes', bonuscodesschema);

        model.find(function (err, docs) {

            if (err)
                return console.log(err);

            return docs.forEach(element => {
                if (element.expiry_date < new Date())
                    element.remove(() => { });
            });
        });
    }
}

delOldCodes();
setInterval(() => delOldCodes(), 1000 * 60 * 60);


router.post('/:project/addcode', auth.required, (req, res, next) => {


    var origin = req.headers.origin;
    if (cfg.api_allowed_cors.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const { payload: { id } } = req;
    const json = req.body;

    if (!utils.project_server_check(req.params.project, null))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    if (!json.code || !json.uses || !json.expiry_date || !json.money || json.money <= 0)
        return res.json({
            error: true,
            message: "malformed request"
        })

    Users.findById(id).then((user) => {
        if (!user)
            return res.sendStatus(401);
        if (user) {
            if (user.is_gadmin) {
                const BCModel = cfg.projects[req.params.project]
                    .settings.database.model('bonuscodes', bonuscodesschema);
                BCModel.findOne({ 'code': json.code }, function (err, bc) {
                    if (err)
                        return res.json({
                            error: true,
                            message: "error in check CodeExists"
                        })
                    if (bc)
                        return res.json({
                            error: true,
                            message: "code is already exists!"
                        });
                    if (!bc)
                        new BCModel({

                            project: req.params.project,
                            expiry_date: json.expiry_date,
                            code: json.code,
                            uses: json.uses,
                            money: json.money

                        }).save(function (err) {
                            if (err)
                                return console.log(err);
                            if (!err)
                                return res.json({
                                    error: false,
                                    message: "OK"
                                });
                        });
                });
            } else {
                res.sendStatus(403);
            }
        }
    });

});

router.get('/:project/activatecode/:code', auth.required, (req, res, next) => {

    var origin = req.headers.origin;
    if (cfg.api_allowed_cors.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const { payload: { id } } = req;

    Users.findById(id).then((user) => {
        if (!user)
            return res.sendStatus(400);
        if (user) {
            const BCModel = cfg.projects[req.params.project]
                .settings.database.model('bonuscodes', bonuscodesschema);
            BCModel.findOne({ code: req.params.code }, function (err, bc) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500).json({
                        error: true,
                        message: "error in check CodeExists"
                    });
                }
                if (!bc)
                    return res.json({
                        error: true,
                        message: "code does not exists"
                    })
                if (bc) {
                    if (!(bc.expiry_date > new Date()) || bc.uses_total >= bc.uses)
                        return res.json({
                            error: true,
                            message: "code has expired"
                        })
                    const bc_ubu = cfg.projects[req.params.project]
                        .settings.database.model('bc_usedbyusers', bonuscodesusersschema);
                    bc_ubu.findOne({ linked_user_id: user._id }, function (err, bcubu) {
                        if (err) {
                            console.log(err);
                            return res.json({
                                error: true,
                                message: "error in check activated code or not"
                            });
                        }
                        if (bcubu) {
                            return res.json({
                                error: true,
                                message: "bonus code is already activated!"
                            });
                        }
                        if (!bcubu) {
                            new bc_ubu({ linked_user_id: user._id, code: bc.code }).save().then(() => {
                                bc.updateOne({ uses_total: bc.uses_total + 1 }).then(() => {
                                    Money.findOne({
                                        linked_user_id: user._id,
                                        project: req.params.project
                                    }, function (err, money) {
                                        if (err) {
                                            console.log(err);
                                            return res.sendStatus(500).json({
                                                error: true,
                                                message: "error in find money of user"
                                            });
                                        }
                                        if (!money) {
                                            new Money({
                                                linked_user_id: user._id,
                                                project: req.params.project,
                                                money: bc.money
                                            }).save().then(() => {
                                                return res.json({
                                                    error: false,
                                                    message: "OK"
                                                });
                                            });
                                        }
                                        if (money) {
                                            money.updateOne({
                                                money: money.money + bc.money
                                            }).then(() => {
                                                return res.json({
                                                    error: false,
                                                    message: "OK"
                                                });
                                            })
                                        }
                                    });
                                });
                            });
                        }
                    });
                }
            });
        }
    });

});

module.exports = router;