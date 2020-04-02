const cfg = require('./config/constants');

module.exports.project_server_check = function(projectname, servername) {
    var boolean = false;
    if (cfg.projects[projectname])
        for (server in cfg.projects[projectname])
            if (servername == server)
                boolean = true;
    return boolean;
}