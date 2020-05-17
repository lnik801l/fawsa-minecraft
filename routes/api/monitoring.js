const router = require('express').Router();

const auth = require('../auth');
const cfg = require('../../config/constants');
const utils = require('../../utils');
const ping = require('minecraft-ping');

let cache = {};
let updateOnline = function(projectname, server, servername, index) {
    ping.ping_fe01({ host: server.host, port: server.port }, function(err, res) {
        if (err) {
            if (!cache[projectname])
                cache[projectname] = {};
            cache[projectname][servername] = {
                index: index,
                servername: servername,
                online: false
            }
        }
        if (res) {
            cache[projectname][servername] = {
                index: index,
                servername: servername,
                version: res.gameVersion,
                online: true,
                motd: res.motd,
                online_now: res.playersOnline,
                online_max: res.maxPlayers * 10
            }
        }

    });
}
var updateAll = function() {
    for (project in cfg.projects) {
        if (!cache[project])
            cache[project] = {};
        let index = 0;
        for (server in cfg.projects[project].servers) {

            if (!cache[project][server])
                cache[project][server] = {};
            if (cfg.projects[project].servers[server].host && cfg.projects[project].servers[server].port) {
                updateOnline(project, cfg.projects[project].servers[server], server, index);
                index++;
            } else {
                console.log(server + ' in project ' + project + ' have corrupted config!');
            }
        }
    }
}
updateAll();
setInterval(() => updateAll(), 1000 * 10);



//GET online of servers (auth optional)
router.get('/:project/get', auth.optional, (req, res, next) => {
    if (!utils.project_server_check(req.params.project, req.params.servername))
        return res.json({
            error: true,
            message: "server or project does not exists!"
        });
    return res.json(cache[req.params.project]);


});

module.exports = router;