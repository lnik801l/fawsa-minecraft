const cfg = require('./config/constants');

module.exports.project_server_check = function(projectname, servername) {
    var boolean = false;
    if (cfg.projects[projectname])
        for (server in cfg.projects[projectname])
            if (servername == server)
                boolean = true;
    return boolean;
}
module.exports.timestamp_after_days = function(number) {
    var date = new Date(Date.now());
    date.setDate(date.getDate() + number);
    return (date.getTime() / 1000 | 0);
}
module.exports.bigIntSerializer = function(num){
    return {
      type: "BigInt",
      value: num.toString()
    };
  }