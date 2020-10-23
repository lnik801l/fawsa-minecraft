const cfg = require('../../config/constants');
const fs = require("fs");
var zlib = require('zlib');
var nbt = require('nbt');
const router = require('express').Router();
const auth = require('../auth');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const utils = require('../../modules/utils');


var trades = {};

for (project in cfg.projects) {
    trades[project] = {};
    for (server in cfg.projects[project].servers) {
        trades[project][server] = {};
    }
}

var trade = {
    "time": "",
    "linked_user_id_1": {
        "items": {},
        "currency": 0
    },
    "linked_user_id_2": {
        "items": {},
        "currency": 0
    },
    "chat": {
        "timestamp": {
            "linked_user_id_1": "message"
        },
        "timestamp2": {
            "linked_user_id_1": "message"
        }
    }
}


//GET get inventory of user (auth required)
router.get('/:project/:servername/getinventory', auth.optional, (req, res, next) => {

    var origin = req.headers.origin;
    if (cfg.api_allowed_cors.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    if (req.payload != null) {
        return Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
                    return res.sendStatus(400);
                } else {
                    if (fs.existsSync(cfg.projects[req.params.project][req.params.servername].serverdir + "/world/playerdata/" + user.uuid + ".dat")) {
                        fs.readFile(cfg.projects[req.params.project][req.params.servername].serverdir + "/world/playerdata/" + user.uuid + ".dat", function (err, data) {
                            if (!err) {
                                nbt.parse(data, function (error, data) {
                                    if (error) {
                                        return res.json({
                                            error: true,
                                            message: "corrupted playerdata!"
                                        });
                                    }
                                    return res.json({
                                        error: false,
                                        inventory: data.value.Inventory.value.value
                                    });
                                });
                            } else {
                                return res.json({
                                    error: true,
                                    message: "error in readFile"
                                });
                            }
                        });
                    } else {
                        return res.json({
                            error: true,
                            message: "inventory does not exists!"
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

//POST trade operations (auth required)
router.post('/:project/:servername/trade', auth.optional, (req, res, next) => {


    var origin = req.headers.origin;
    if (cfg.api_allowed_cors.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    /*
     *   allowed operations:
     *   
     *   createtrade (user2, items1, items2, currency1, currency2)
     * 
     *   updatetrade (user2, items1, items2, currency1, currency2)
     *
     * 
     * 
     */

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    if (req.payload != null) {
        Users.findById(req.payload.id)
            .then((user) => {
                if (!user) {
                    return res.sendStatus(400);
                } else {
                    if (fs.existsSync(cfg.projects[req.params.project][req.params.servername].serverdir + "/world/playerdata/" + user.uuid + ".dat")) {
                        fs.readFile(cfg.projects[req.params.project][req.params.servername].serverdir + "/world/playerdata/" + user.uuid + ".dat", function (err, data) {
                            if (!err) {
                                nbt.parse(data, function (error, data) {
                                    if (error) {
                                        res.json({
                                            error: true,
                                            message: "corrupted playerdata!"
                                        });
                                        throw error;
                                    }
                                    return res.json({
                                        error: false,
                                        inventory: data.value.Inventory.value.value
                                    });
                                });
                            } else {
                                return res.json({
                                    error: true,
                                    message: "error in readFile"
                                });
                            }
                        });
                    } else {
                        return res.json({
                            error: true,
                            message: "inventory does not exists!"
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


module.exports = router;