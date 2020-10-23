const mongoose = require('mongoose');
const router = require('express').Router();
const Users = mongoose.model('Users');
const Money = mongoose.model('Money');
const md5 = require('md5');
const sha1 = require('sha1');
const fs = require('fs');

const auth = require('../auth');
const utils = require('../../modules/utils');
const cfg = require('../../config/constants');
const voteSchema = require('../../per-project-schemas/votes').schema;

let checkCache = function () {
    if (!fs.existsSync(cfg.appDir + "cache")) {
        fs.mkdir(cfg.appDir + "cache", function (err) {
            if (err)
                console.log(err);
            if (!err) {
                fs.writeFile(cfg.appDir + "cache/top_clear_month", new Date().getMonth(), function () { });
            }
        })
    } else {
        fs.readFile(cfg.appDir + "cache/top_clear_month", function (err, data) {
            if (err)
                console.log(err);
            if (!err) {
                if (data.toString() != new Date().getMonth())
                    fs.writeFile(cfg.appDir + "cache/top_clear_month", new Date().getMonth().toString(), function (err) {
                        if (err)
                            console.log(err);
                        if (!err) {
                            for (project in cfg.projects) {
                                var VotesModel = cfg.projects[project].settings.database.model('Votes', voteSchema);
                                VotesModel.find(function (err, votes) {
                                    if (err)
                                        console.log(err);
                                    if (votes) {
                                        for (vote in votes) {
                                            votes[vote].updateOne({ votes: 0 }).then(() => { });
                                        }
                                    }
                                });
                            }

                        }
                    })
            }
        });
    }
}

let htmlspecialchars = function (html) {
    var div = document.createElement('div');
    div.innerText = html;
    return div.innerHTML;
}

checkCache();
setInterval(() => checkCache(), 1000 * 60 * 60);

//GET reward for specific project (mctop)
router.get('/:project/mctop', auth.optional, (req, res, next) => {

    var flag = true;
    for (project in cfg.projects)
        if (project == req.params.project)
            flag = false;
    if (flag)
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (md5(req.query.nickname + cfg.projects[req.params.project].settings.rewards_params.mctop_secret) == req.query.token)

        Users.findOne({ username: req.query.nickname })
            .then((user) => {
                if (!user) {
                    return res.json({
                        error: true,
                        message: "user does not exists"
                    });
                }
                if (user) {
                    Money.findOne({ linked_user_id: user._id, project: req.params.project }, function (err, money) {
                        const VotesModel = cfg.projects[req.params.project].settings.database.model('Votes', voteSchema);
                        //const VotesModel = cfg.projects.galaxy.settings.database.model('Votes', voteSchema);
                        if (err)
                            return res.json({
                                error: true,
                                message: "error in check moneyExists"
                            });
                        if (!money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                            });

                        }
                        if (money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                            });


                        }

                    });
                }

            });
    else res.sendStatus(403);

});

//POST reward for specific project (topcraft)
router.post('/:project/topcraft', auth.optional, (req, res, next) => {

    var flag = true;
    for (project in cfg.projects)
        if (project == req.params.project)
            flag = false;
    if (flag)
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (sha1(req.body.username + req.body.timestamp + cfg.projects[req.params.project].settings.rewards_params.topcraft_secret) == req.body.signature)

        Users.findOne({ username: req.body.username })
            .then((user) => {
                if (!user) {
                    return res.json({
                        error: true,
                        message: "user does not exists"
                    });
                }
                if (user) {
                    Money.findOne({ linked_user_id: user._id, project: req.params.project }, function (err, money) {
                        const VotesModel = cfg.projects[req.params.project].settings.database.model('Votes', voteSchema);
                        //const VotesModel = cfg.projects.galaxy.settings.database.model('Votes', voteSchema);
                        if (err)
                            return res.json({
                                error: true,
                                message: "error in check moneyExists"
                            });
                        if (!money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                            });

                        }
                        if (money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                            });


                        }

                    });
                }

            });
    else res.sendStatus(403);

});

//POST reward for specific project (topcraft)
router.post('/:project/fairtop', auth.optional, (req, res, next) => {

    var flag = true;
    for (project in cfg.projects)
        if (project == req.params.project)
            flag = false;
    if (flag)
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    if (md5(sha1(req.body.player + ":" + cfg.projects[req.params.project].settings.rewards_params.fairtop_secret)) == req.body.hash)

        Users.findOne({ username: req.body.player })
            .then((user) => {
                if (!user) {
                    return res.json({
                        error: true,
                        message: "user does not exists"
                    });
                }
                if (user) {
                    Money.findOne({ linked_user_id: user._id, project: req.params.project }, function (err, money) {
                        const VotesModel = cfg.projects[req.params.project].settings.database.model('Votes', voteSchema);
                        //const VotesModel = cfg.projects.galaxy.settings.database.model('Votes', voteSchema);
                        if (err)
                            return res.json({
                                error: true,
                                message: "error in check moneyExists"
                            });
                        if (!money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        new Money({ linked_user_id: user._id, project: req.params.project, votes: 1 }).save().then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    })
                                }
                            });

                        }
                        if (money) {
                            VotesModel.findOne({ linked_user_id: user._id }).then((vote) => {
                                if (!vote) {
                                    new VotesModel({ linked_user_id: user._id, votes: 1 }).save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                                if (vote) {
                                    vote.votes++;
                                    vote.save().then(() => {
                                        money.updateOne({ money: money.votes++ }).then(() => {
                                            return res.json({
                                                error: false,
                                                message: "OK"
                                            });
                                        });
                                    });
                                }
                            });


                        }

                    });
                }

            });
    else res.sendStatus(403);

});

//get top of voting players (starts from 2 votes)
router.get('/:project/votes_top', auth.optional, (req, res, next) => {

    var flag = true;
    for (project in cfg.projects)
        if (project == req.params.project)
            flag = false;
    if (flag)
        return res.json({
            error: true,
            message: "project does not exists!"
        });

    //const VotesModel = cfg.projects.galaxy.settings.database.model('Votes', voteSchema);
    const VotesModel = cfg.projects[req.params.project].settings.database.model('Votes', voteSchema);
    VotesModel.find().where('votes').gt(2).sort('votes').exec(function (err, votes) {
        if (err) {
            console.log(err);
            return res.json({
                error: true,
                message: "error in get votes collections"
            });
        }
        if (votes) {
            let tempvotes = votes;
            tempvotes.forEach(element => {
                element._id = null;
            });
            return res.json({
                error: false,
                message: tempvotes
            });
        }

    });

});


module.exports = router;