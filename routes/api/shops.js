const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const Cart = mongoose.model('Carts');
const { Image } = require('image-js');
const cfg = require('../../config/constants');
const fs = require("fs");
const request = require('request');

var cache = {};

function updateCache(project, server) {
  const url = cfg.projects[project][server].offer_server_url;
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
    }, function (error, response, body) {
    if (error) {
      cache[project][server].error = true;
    }
    if (!error && response.statusCode == 200) {
      cache[project][server].items = JSON.parse(body);
      cache[project][server].error = false;
    }
  })
}
for (project in cfg.projects) {
  cache[project] = {};
  for (server in cfg.projects[project]) {
    cache[project][server] = {};
    updateCache(project, server);
    setInterval(() => updateCache(project, server), 1000 * 60 * 5);
  }
}

//GET all items from in-game shop (auth not required)
router.get('/:project/:servername/getshopallitems', auth.optional, (req, res, next) => {
  var boolean = false;

  for (project in cfg.projects) 
      for (server in cfg.projects[project])
          if (req.params.servername == server)
              boolean = true;

  if (boolean) {
    res.json({
        error: cache[req.params.project][req.params.servername],
        items: cache[req.params.project][req.params.servername]
    });    
  } else {
    res.json({
      error: true,
      message: "project or server does not exists!"
    });    
  }
    
});

//GET all items in cart (auth required)
router.get('/:project/:servername/getcartitems', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
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

  
    Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }

        Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
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
                cart.updateOne({items: newItems});
              if (flag1)
                cart.updateOne({bought_items: newBoughtItems});
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
  
    return Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }

        Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
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
                    cart.updateOne({items: newCartItems}).then(() => {
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
                var newCart = new Cart({linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername, items: newCartItems});
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

    return Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }

        Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
            if (err) { 

              console.log("ban nahooi"); 
              return res.json({
                error: true,
                message: "error in findCart"
              });

            }
            if (cart) {

                cart.updateOne({items: {}});
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

  Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
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
              cart.updateOne({items: newItems}).then(() => {
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
  
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
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

              cart.updateOne({items: updatedCartItems}).then(() => {
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
                  user.updateOne({money: user.money - totalPrice}).then(() => {
                    cart.updateOne({items: newItems}).then(() => {
                      cart.updateOne({bought_items: newBoughtItems}).then(() => {
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

  Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      Cart.findOne({ linked_user_id: user._id, linked_projectname: req.params.project, linked_servername: req.params.servername }, function (err, cart) {
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
              cart.updateOne({bought_items: newBoughtItems}).then(() => {
                user.updateOne({money: newMoney}).then(() => {
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

module.exports = router;