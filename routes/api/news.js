const router = require('express').Router();
const request = require('request');

const cfg = require('../../config/constants');
const utils = require('../../modules/utils');
const auth = require('../auth');

var cache = {};


let updateNews = function (project) {
    const p = project;
    request({
        method: 'GET',
        url: 'http://api.vk.com/method/wall.get?owner_id=' +
            cfg.projects[p].settings.vk_group_id +
            '&access_token=' + cfg.vk_news_parser_service_key +
            '&count=10&v=' + cfg.vk_api_ver,
    }, function (error, response, body) {
        if (error) {
            if (!cache[project])
                cache[project] = {};
            cache[project].error = true;
        }
        if (!error && response.statusCode == 200) {
            if (!cache[project])
                cache[project] = {};
            if (!cache[project].signers_info)
                cache[project].signers_info = {};

            var temp = JSON.parse(body).response.items;

            request({
                method: 'GET',
                url: 'http://api.vk.com/method/groups.getById?group_id=' + Math.abs(cfg.projects[p].settings.vk_group_id) +
                    '&access_token=' + cfg.vk_news_parser_service_key +
                    '&fields=name&v=' + cfg.vk_api_ver,
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    cache[project].error = true;
                }
                if (!error && response.statusCode == 200) {
                    cache[project].signers_info.group = JSON.parse(body).response[0];
                }
            })

            for (i in temp) {
                if (temp[i].text.length > 200) {
                    temp[i].is_oppened = false;
                    temp[i].short_text = temp[i].text.substr(0, 200) + '...';
                    temp[i].temp_text = temp[i].text.substr(0, 200) + '...';

                }
                if (temp[i].signer_id && !cache[project].signers_info[temp[i].signer_id]) {
                    request({
                        method: 'GET',
                        url: 'http://api.vk.com/method/users.get?user_ids=' + temp[i].signer_id +
                            '&access_token=' + cfg.vk_news_parser_service_key +
                            '&fields=photo_100,domain&v=' + cfg.vk_api_ver,
                    }, function (error, response, body) {
                        if (error) {
                            console.log(error);
                            cache[project].error = true;
                        }
                        if (!error && response.statusCode == 200) {
                            var userInfo = JSON.parse(body).response[0];
                            cache[project].signers_info[userInfo.id] = JSON.parse(body).response[0];
                        }
                    })
                }
            }

            cache[project].posts = temp;
            cache[project].error = false;
        }
    })
}
let updateCache = function () {
    for (p in cfg.projects) {
        if (cfg.projects[p].settings.vk_group_id) {
            updateNews(p);
        }
    }
}
/*
updateCache();
setInterval(() => updateCache(), 1000 * 60 * 1);
*/
router.get('/:project/getnews', auth.optional, function (req, res, next) {

    var origin = req.headers.origin;
    if (cfg.api_allowed_cors.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });
    return res.json({
        error: cache[req.params.project].error,
        posts: cache[req.params.project].posts,
        signers_info: cache[req.params.project].signers_info
    });
});


module.exports = router;