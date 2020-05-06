const router = require('express').Router();
const request = require('request');

const cfg = require('../../config/constants');
const utils = require('../../utils');
const auth = require('../auth');

var cache = {};


let updateNews = function(project) {
    const p = project;
    request({
        method: 'GET',
        url: 'http://api.vk.com/method/wall.get?owner_id=' +
            cfg.projects[p].settings.vk_group_id +
            '&access_token=' + cfg.vk_news_parser_service_key +
            '&count=10&v=5.3',
    }, function(error, response, body) {
        if (error) {
            cache[project].error = true;
        }
        if (!error && response.statusCode == 200) {
            if (!cache[project])
                cache[project] = {};
            cache[project].posts = JSON.parse(body).response;
            cache[project].error = false;
        }
    })
}
let updateCache = function() {
    for (p in cfg.projects) {
        if (cfg.projects[p].settings.vk_group_id) {
            updateNews(p);
        }
    }
}

updateCache();
setInterval(() => updateCache(), 1000 * 60 * 1);

router.get('/:project/getnews', auth.optional, function(req, res, next) {
    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });
    return res.json({
        error: cache[req.params.project].error,
        posts: cache[req.params.project].posts
    });
});


module.exports = router;