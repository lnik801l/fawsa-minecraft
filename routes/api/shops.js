const mongoose = require('mongoose');
const router = require('express').Router();
const Users = mongoose.model('Users');
const Cart = mongoose.model('Carts');
const Group = mongoose.model('Groups');
const Money = mongoose.model('Money');
var MongoClient = require('mongodb').MongoClient;
const Long = require('mongodb').Long;
const request = require('request');
const fs = require('fs');

const cfg = require('../../config/constants');
const utils = require('../../utils');
const auth = require('../auth');

var cache = {};

function updateCache(project, server) {
    const url = cfg.projects[project].servers[server].offer_server_url;
    console.log("[" + project + "] [" + server + "] interval");
    request({
        method: 'GET',
        url: url,
        // параметры GET-запроса
        // index.php?param=edit&value=10
        /*qs: {
          param: 'edit',
          value: 100
        }*/
    }, function(error, response, body) {
        if (error) {
            cache[project][server].error = true;
        }
        if (!error && response.statusCode == 200) {
            fs.readFile(cfg.appDir + 'items.json', function(err, buffer) {
                if (err)
                    return console.log(err);
                let localCache = JSON.parse(body);
                let translitions = JSON.parse(buffer.toString());
                for (item in localCache) {
                    localCache[item].name = translitions[localCache[item].itemstack.registry_name + ":" + localCache[item].itemstack.damage];
                    localCache[item].id = item;
                }
                cache[project][server].items = localCache;
                cache[project][server].error = false;
            });

        }
    })
}

for (project in cfg.projects) {
    if (!cache[project])
        cache[project] = {};
    for (server in cfg.projects[project].servers) {
        if (!cache[project][server])
            cache[project][server] = {};
        updateCache(project, server);
    }
}

setInterval(() => {
    for (project in cfg.projects) {
        if (!cache[project])
            cache[project] = {};
        for (server in cfg.projects[project].servers) {
            if (!cache[project][server])
                cache[project][server] = {};
            updateCache(project, server);
        }
    }
}, 1000 * 60 * 5);



//GET all items from in-game shop (auth not required)
router.get('/:project/:servername/getshopallitems', auth.optional, (req, res, next) => {

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    return res.json({
        error: cache[req.params.project][req.params.servername].error,
        items: cache[req.params.project][req.params.servername].items
    });


});

//GET all items in cart (auth required)
router.get('/:project/:servername/getcartitems', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });


    Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {

                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {
                    var newItems = cart.items;
                    var newBoughtItems = cart.bought_items;
                    var flag = false;
                    var flag1 = false;
                    for (item in newItems) {
                        if (!cache[req.params.project][req.params.servername].items[item]) {
                            delete newItems[item];
                            flag = true;
                        }
                    }
                    for (item in newBoughtItems) {
                        if (!cache[req.params.project][req.params.servername].items[item]) {
                            delete newBoughtItems[item];
                            flag1 = true;
                        }
                    }
                    if (flag)
                        cart.updateOne({ items: newItems });
                    if (flag1)
                        cart.updateOne({ bought_items: newBoughtItems });
                    return res.json({
                        error: false,
                        message: "OK",
                        items: cart.items,
                        bought_items: cart.bought_items
                    });
                } else {
                    return res.json({
                        error: true,
                        message: "cart == null!"
                    });
                }
            });

        });
});

//POST add item to cart (auth required)
router.post('/:project/:servername/addtocart', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const item = req.body;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {

                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    if (item) {
                        var newCartItems = cart.items;
                        for (i in item) {
                            if (item[i].count && item[i].count > 0 && cache[req.params.project][req.params.servername].items[i])
                                newCartItems[i] = item[i];
                            else
                                return res.json({
                                    error: true,
                                    message: "corrupted item(s)!"
                                });
                        }
                        cart.updateOne({ items: newCartItems }).then(() => {
                            return res.json({
                                error: false,
                                items: cart.items
                            });
                        });

                    } else {
                        console.log(item);
                        return res.json({
                            error: true,
                            message: "item == null1!"
                        });
                    }

                } else {
                    console.log("no cart");

                    if (item) {
                        var newCartItems = {};
                        for (i in item) {
                            if (item[i].count && item[i].count > 0 && cache[req.params.project][req.params.servername].items[i])
                                newCartItems[i] = item[i];
                            else
                                return res.json({
                                    error: true,
                                    message: "corrupted item(s)!"
                                });
                        }
                        var newCart = new Cart({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername, items: newCartItems });
                        newCart.save().then(() => {
                            return res.json({
                                error: false,
                                items: newCart.items
                            });
                        });

                    } else {
                        return res.json({
                            error: true,
                            message: "item == null1!"
                        });
                    }

                }
            });

        });
});

//GET clear cart (auth required)
router.get('/:project/:servername/clearcart', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {

                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    cart.updateOne({ items: {} });
                    return res.json({
                        error: false,
                        message: "OK",
                        cart: cart
                    });

                } else {
                    console.log("no cart");

                    return res.json({
                        error: true,
                        message: "cart == null!"
                    });

                }
            });

        });
});

//POST del item(s) from cart (auth required)
router.post('/:project/:servername/delcartitems', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const items = req.body;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {

                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    if (items) {
                        var newItems = {};
                        if (cart.items)
                            newItems = cart.items;
                        for (i in items) {
                            delete newItems[i];
                        }
                        cart.updateOne({ items: newItems }).then(() => {
                            return res.json({
                                error: false,
                                message: "OK",
                                cart: cart
                            });
                        });
                    } else {
                        return res.json({
                            error: true,
                            message: "corrupt items!"
                        });
                    }


                } else {
                    console.log("no cart");

                    return res.json({
                        error: true,
                        message: "cart == null!"
                    });

                }
            });

        });
});

//GET buy all items from cart (auth required)
router.get('/:project/:servername/buycart', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {
                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });
                }
                if (cart) {

                    if (cache[req.params.project][req.params.servername]) {

                        var totalPrice = 0;
                        var updatedCartItems = cart.items;
                        for (item in cart.items) {
                            if (cache[req.params.project][req.params.servername].items[item])
                                totalPrice += cache[req.params.project][req.params.servername].items[item].price * updatedCartItems[item].count;
                            else
                                delete updatedCartItems[item];
                        }

                        cart.updateOne({ items: updatedCartItems }).then(() => {
                            if (user.money < totalPrice) {
                                return res.json({
                                    error: true,
                                    message: "not enough currency!",
                                    moneyneed: totalPrice - user.money
                                });
                            } else {
                                var newBoughtItems = {};
                                var newItems = {};

                                if (cart.bought_items)
                                    newBoughtItems = cart.bought_items;
                                if (cart.items)
                                    newItems = cart.items;

                                for (item in newItems) {
                                    if (newBoughtItems[item])
                                        newBoughtItems[item].count += newItems[item].count;
                                    else
                                        newBoughtItems[item] = newItems[item];
                                }
                                newItems = {};
                                console.log(newBoughtItems);
                                user.updateOne({ money: user.money - totalPrice }).then(() => {
                                    cart.updateOne({ items: newItems }).then(() => {
                                        cart.updateOne({ bought_items: newBoughtItems }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });

                                    });
                                });
                            }
                        });


                    } else {
                        return res.json({
                            error: true,
                            message: "error in serverOfferCache"
                        });
                    }


                } else {
                    console.log("no cart");

                    return res.json({
                        error: true,
                        message: "cart == null!"
                    });

                }
            });

        });
});

//POST del bought item(s) from cart (auth required)
router.post('/:project/:servername/delcartboughtitems', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const items = req.body;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function(err, cart) {
                if (err) {

                    console.log("ban nahooi");
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    if (items) {
                        var newBoughtItems = {};
                        var newMoney = user.money;
                        if (cart.items)
                            newBoughtItems = cart.bought_items;
                        for (i in items) {
                            if (newBoughtItems != null) {
                                if (cache[req.params.project][req.params.servername].items[i])
                                    newMoney += ((cache[req.params.project][req.params.servername].items[i].price * cart.bought_items[i].count) / 100 * 80);
                                delete newBoughtItems[i];
                            }
                        }
                        cart.updateOne({ bought_items: newBoughtItems }).then(() => {
                            user.updateOne({ money: newMoney }).then(() => {
                                return res.json({
                                    error: false,
                                    message: "OK",
                                    cart: cart
                                });
                            });
                        });
                    } else {
                        return res.json({
                            error: true,
                            message: "corrupt items!"
                        });
                    }


                } else {
                    console.log("no cart");

                    return res.json({
                        error: true,
                        message: "cart == null!"
                    });

                }
            });

        });
});

//POST add donate group for specific project (admin required)
router.post('/:project/addgroup', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const json = req.body;
    var boolean = false;

    for (project in cfg.projects)
        if (req.params.project == project)
            boolean = true;

    if (!boolean)
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });
    if (!json.name || !json.lp_name || !json.expires_in_days || !json.icon_url || !json.cost)
        return res.json({
            error: true,
            message: "malformed query"
        });

    Users.findById(id)
        .then((user) => {

            if (!user) {
                return res.sendStatus(400);
            }
            if (!user.is_gadmin)
                return res.json({
                    error: true,
                    message: "you are not admin!"
                });
            if (user.is_gadmin) {
                Group.findOne({ project: req.params.project, name: json.name, cost: json.cost, expires_in_days: json.expires_in_days }, function(err, group) {
                    if (err)
                        res.json({
                            error: true,
                            message: "error in check groupExists"
                        });
                    if (group)
                        res.json({
                            error: true,
                            message: "group already exists!"
                        });
                    if (!group)
                        newgroup = new Group({
                            name: json.name,
                            lp_name: json.lp_name,
                            project: req.params.project,
                            expires_in_days: json.expires_in_days,
                            icon_url: json.icon_url,
                            cost: json.cost
                        }).save().then(() => {
                            return res.json({
                                error: false,
                                message: "group successfully added!"
                            });
                        });
                });
            }

        });
});

//POST delete donate group for specific project (admin required)
router.post('/:project/deletegroup', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const json = req.body;
    var boolean = false;

    for (project in cfg.projects)
        if (req.params.project == project)
            boolean = true;

    if (!boolean)
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });
    if (!json.name || !json.lp_name || !json.expires_in_days || !json.icon_url || !json.cost)
        return res.json({
            error: true,
            message: "malformed query"
        });

    Users.findById(id)
        .then((user) => {

            if (!user) {
                return res.sendStatus(400);
            }
            if (!user.is_admin)
                return res.json({
                    error: true,
                    message: "you are not admin!"
                });
            if (user.is_gadmin) {
                Group.findOne({ project: req.params.project, name: json.name, cost: json.cost, expires_in_days: json.expires_in_days }, function(err, group) {
                    if (err)
                        return res.json({
                            error: true,
                            message: "error in check groupExists"
                        });
                    if (group) {
                        group.remove(function(err, document) {
                            if (err)
                                return res.json({
                                    error: true,
                                    message: "cannot remove group!"
                                });
                            if (document) {
                                return res.json({
                                    error: false,
                                    message: "OK"
                                })
                            }
                        });
                    }
                    if (!group)
                        return res.json({
                            error: true,
                            message: "group does not exists!"
                        });
                });
            }

        });
});

//GET all groups for specific project (auth not required)
router.get('/:project/getgroups', auth.optional, (req, res, next) => {
    Group.find({ project: req.params.project }, function(err, collections) {
        if (err)
            return res.json({
                error: true,
                message: "error in find groups!"
            });
        if (collections)
            return res.json({
                error: false,
                groups: collections
            });
        if (!collections)
            return res.json({
                errror: true,
                message: "groups for that project not found!"
            });
    });
});

router.post('/:project/:servername/buygroup', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    const json = req.body;

    if (!json._id)
        return res.json({
            error: true,
            message: "malformed request"
        })

    var flag2 = false;

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });

    Users.findById(id)
        .then((user) => {
            if (!user)
                return res.sendStatus(401);
            if (user) {

                Money.findOne({ linked_user_id: user._id, project: req.params.project }, function(err, money) {
                    if (err)
                        return res.json({
                            error: true,
                            message: "error in check MoneyExists"
                        })
                    if (!money)
                        return res.json({
                            error: true,
                            message: "you do not have enough currency!"
                        })
                    if (money) {
                        Group.findById(json._id, function(err, group) {
                            if (err) {
                                return res.json({
                                    error: true,
                                    message: "invalid id"
                                })
                            }
                            if (!group)
                                return res.json({
                                    error: true,
                                    message: "invalid id"
                                })

                            if (money.money >= group.cost) {

                                MongoClient.connect(cfg.mongodb_url, function(err, db) {
                                    if (err) throw err;
                                    var db_project = db.db(cfg.projects[req.params.project].settings.db_name);

                                    db_project.collection("luckperms_uuid").findOne({ name: user.username }, function(err, uuid) {
                                        if (err)
                                            throw err;
                                        if (!uuid)
                                            return res.json({
                                                error: true,
                                                message: "you must join game once!"
                                            })
                                        if (uuid) {
                                            db_project.collection("luckperms_users").findOne({ _id: uuid._id }, function(err, lp_user) {
                                                if (err)
                                                    throw err;
                                                if (!lp_user) {
                                                    money.updateOne({ money: money.money - group.cost }).then(() => {
                                                        db_project.collection("luckperms_users").insertOne({
                                                            _id: uuid._id,
                                                            name: user.username,
                                                            primaryGroup: "default",
                                                            permissions: [{
                                                                    key: group.lp_name,
                                                                    value: true,
                                                                    expiry: Long.fromInt(utils.timestamp_after_days(group.expires_in_days)),
                                                                    context: [{
                                                                        key: "server",
                                                                        value: req.params.servername
                                                                    }]
                                                                },
                                                                {
                                                                    key: "group.default",
                                                                    value: true
                                                                }
                                                            ]
                                                        }, function(err, result) {
                                                            db.close();
                                                            if (err) {
                                                                res.json({
                                                                    error: true,
                                                                    message: "write your project administrator"
                                                                })
                                                                throw err;
                                                            }
                                                            if (!err)
                                                                return res.json({
                                                                    error: false,
                                                                    message: "OK"
                                                                })
                                                        });
                                                    });
                                                }
                                                if (lp_user) {
                                                    money.updateOne({ money: money.money - group.cost }).then(() => {
                                                        let testvar = lp_user.permissions;
                                                        let flag = false;
                                                        for (i in testvar) {
                                                            if (testvar[i].key == group.lp_name && testvar[i].expiry > (Date.now() / 1000 | 0) &&

                                                                function() {
                                                                    if (testvar[i].context)
                                                                        for (j in testvar[i].context) {
                                                                            if (testvar[i].context[j].key == server && testvar[i].context[j.value == req.params.servername])
                                                                                return true;
                                                                        }
                                                                    return false;
                                                                }) {
                                                                flag = true;
                                                                testvar[i].expiry += (utils.timestamp_after_days(group.expires_in_days) - (Date.now() / 1000 | 0))
                                                            }
                                                        }
                                                        if (!flag) {
                                                            testvar.push({
                                                                key: group.lp_name,
                                                                value: true,
                                                                expiry: Long.fromInt(utils.timestamp_after_days(group.expires_in_days)),
                                                                context: [{
                                                                    key: "server",
                                                                    value: req.params.servername
                                                                }]
                                                            })
                                                        }
                                                        for (item in testvar) {
                                                            if (testvar[item].expiry)
                                                                testvar[item].expiry = Long.fromInt(testvar[item].expiry);
                                                        }
                                                        db_project.collection("luckperms_users").updateOne({
                                                            "_id": lp_user._id
                                                        }, {
                                                            $set: { "permissions": testvar }
                                                        }, function(err, result) {
                                                            if (err) {
                                                                res.json({
                                                                    error: true,
                                                                    message: "write to your project administrator"
                                                                });
                                                                throw err;
                                                            }
                                                            if (!err) {
                                                                return res.json({
                                                                    error: false,
                                                                    message: "OK"
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
                                            })
                                        }
                                    });
                                });

                            } else return res.json({
                                error: true,
                                message: "not enough currency!"
                            })
                        });
                    }
                });
            }
        });



});

module.exports = router;