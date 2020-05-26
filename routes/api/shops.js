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
}, 1000 * 60 * 1);



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

            if (!cache[req.params.project][req.params.servername].items || cache[req.params.project][req.params.servername].error) {
                return res.json({
                    error: true,
                    message: "error in find cache!"
                })
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
                    let tempItems = cart.items;
                    let flag = false;

                    tempItems.forEach(function(e, index, object) {
                        if (!cache[req.params.project][req.params.servername].items[e.id]) {
                            object.splice(index, 1);
                            flag = true;
                        }

                    });
                    if (flag)
                        cart.updateOne({ items: tempItems }).then(() => {
                            return res.json({
                                error: false,
                                message: "OK",
                                items: cart.items,
                                bought_items: cart.bought_items
                            });
                        });
                    else
                        return res.json({
                            error: false,
                            message: "OK",
                            items: cart.items,
                            bought_items: cart.bought_items
                        });
                } else {
                    new Cart({
                        linked_user_id: user._id,
                        linked_projectname: req.params.project,
                        linked_servername: req.params.servername,
                        items: [],
                        bought_items: []
                    }).save().then(() => {
                        return res.json({
                            error: false,
                            message: "OK",
                            items: [],
                            bought_items: []
                        });
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

                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {
                    if (item instanceof Array) {
                        let flag = false;
                        item.forEach(e => {
                            e.count = Number(e.count);
                            if (e.count <= 0)
                                flag = true;
                        });
                        if (flag)
                            return res.json({
                                error: true,
                                message: "invalid count!"
                            })
                        if (cart.items == undefined || cart.items == null)
                            var newCartItems = item;
                        else
                            var newCartItems = cart.items;
                        item.forEach(e1 => {
                            let flag = false;
                            newCartItems.forEach(e2 => {
                                if (e2.id == e1.id) {
                                    e2.count += e1.count;
                                    flag = true;
                                }
                            });
                            if (!flag) {
                                newCartItems.push(e1);
                            }
                        });
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
                            message: "corrupted item(s)!"
                        });
                    }

                } else {
                    console.log("no cart");

                    if (item instanceof Array) {
                        new Cart({
                            linked_user_id: user._id,
                            linked_projectname: req.params.project,
                            linked_servername: req.params.servername,
                            items: item,
                            bought_items: []
                        }).save().then((createdCart) => {
                            return res.json({
                                error: false,
                                items: createdCart.items
                            });
                        });

                    } else {
                        console.log(item);
                        return res.json({
                            error: true,
                            message: "corrupted item(s)!"
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
                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    cart.updateOne({ items: [] }).then(() => {
                        return res.json({
                            error: false,
                            message: "OK",
                            cart: {
                                items: [],
                                bought_items: cart.bought_items
                            }
                        });
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

                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    if (items instanceof Array) {
                        var newItems = [];
                        if (cart.items)
                            newItems = cart.items;

                        newItems.forEach(function(e, index, object) {
                            items.forEach(e1 => {
                                if (e1 == e.id)
                                    object.splice(index, 1);
                            });

                        });
                        cart.updateOne({ items: newItems }).then(() => {
                            return res.json({
                                error: false,
                                message: "OK",
                                cart: {
                                    items: newItems,
                                    bought_items: cart.bought_items
                                }
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

//GET decrement item from cart (auth required)
router.get('/:project/:servername/decrementitem/:id', auth.required, (req, res, next) => {
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

                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    let newItems = cart.items;
                    newItems.forEach(function(e, index, object) {
                        if (e.id == req.params.id)
                            e.count--;
                        if (e.count <= -1) {
                            object.splice(index, 1);
                        }

                    });

                    cart.updateOne({ items: newItems }).then(() => {
                        return res.json({
                            error: false,
                            message: "OK",
                            cart: {
                                items: newItems,
                                bought_items: cart.bought_items
                            }
                        })
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

//GET increment item from cart (auth required)
router.get('/:project/:servername/incrementitem/:id', auth.required, (req, res, next) => {
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

                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });

                }
                if (cart) {

                    let newItems = cart.items;
                    newItems.forEach(e => {
                        if (e.id == req.params.id)
                            e.count++;
                    });

                    cart.updateOne({ items: newItems }).then(() => {
                        return res.json({
                            error: false,
                            message: "OK",
                            cart: {
                                items: newItems,
                                bought_items: cart.bought_items
                            }
                        })
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

//GET buy all items from cart (auth required)
router.get('/:project/:servername/buycart', auth.required, (req, res, next) => {
    console.log("ПРОВЕРЬ МЕНЯ")
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
                    console.log(err);
                    return res.json({
                        error: true,
                        message: "error in findCart"
                    });
                }
                if (cart) {

                    Money.findOne({ linked_user_id: user._id, project: req.params.project }, function(err, money) {
                        if (err) {
                            console.log(err);
                            return res.json({
                                error: true,
                                message: "error in findMoney"
                            })
                        }
                        if (money) {
                            if (cache[req.params.project][req.params.servername]) {

                                var temp = new Array();
                                cart.items.forEach(e => {
                                    temp.push(e);
                                });

                                var totalPrice = 0;
                                var updatedCartItems = cart.items;

                                updatedCartItems.forEach(function(e, index, object) {
                                    if (cache[req.params.project][req.params.servername].items[e.id]) {
                                        totalPrice += (cache[req.params.project][req.params.servername].items[e.id].price -
                                                (cache[req.params.project][req.params.servername].items[e.id].price / 100 * cache[req.params.project][req.params.servername].items[e.id].discount)) *
                                            e.count;
                                    } else {
                                        console.log("aga");
                                        object.splice(index, 1);
                                    }
                                });

                                if (money.realmoney < totalPrice) {
                                    console.log(temp);
                                    return res.json({
                                        error: true,
                                        cart: {
                                            items: temp,
                                            bought_items: cart.bought_items
                                        },
                                        message: "not enough currency!",
                                        moneyneed: totalPrice - money.realmoney
                                    });
                                }

                                cart.updateOne({ items: updatedCartItems }).then(() => {

                                    console.log(`
                                    1
                                    2
                                    3


                                    .
                                    `);

                                    var newBoughtItems = [];
                                    if (cart.bought_items)
                                        newBoughtItems = cart.bought_items;

                                    updatedCartItems.forEach(e => {
                                        let flag = false;
                                        newBoughtItems.forEach(e1 => {
                                            if (e1.id == e.id) {
                                                flag = true;
                                                e1.count += Number(e.count);

                                            }
                                        });
                                        if (!flag) {
                                            console.log(e);
                                            newBoughtItems.push(e);
                                        }
                                    })

                                    money.updateOne({ realmoney: Number(money.realmoney) - Number(totalPrice) }).then(() => {
                                        cart.updateOne({ items: [] }).then(() => {
                                            cart.updateOne({ bought_items: newBoughtItems }).then(() => {
                                                return res.json({
                                                    error: false,
                                                    cart: {
                                                        items: [],
                                                        bought_items: cart.bought_items
                                                    },
                                                    message: "OK"
                                                });
                                            });

                                        });
                                    });
                                });


                            } else {
                                return res.json({
                                    error: true,
                                    message: "error in serverOfferCache"
                                });
                            }
                        }
                        if (!money) {
                            return res.json({
                                error: true,
                                message: "money == null!1"
                            })
                        }
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
                        var newMoney = user.realmoney;
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
                            user.updateOne({ realmoney: newMoney }).then(() => {
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
router.get('/:project/deletegroup/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
    var boolean = false;

    for (project in cfg.projects)
        if (req.params.project == project)
            boolean = true;

    if (!boolean)
        return res.json({
            error: true,
            message: "server or project does not exists!"
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
                Group.findById(req.params.id, function(err, group) {
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

                            if (money.realmoney >= group.cost) {

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
                                                    money.updateOne({ realmoney: Number(money.realmoney) - Number(group.cost) }).then(() => {
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
                                                    money.updateOne({ realmoney: Number(money.realmoney) - Number(group.cost) }).then(() => {
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